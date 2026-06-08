<?php

namespace App\Http\Controllers;

use App\Models\Kerusakan;
use App\Models\Kendaraan;
use App\Models\Keruskaanacc;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Bill;

class KerusakanController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();


        $validated = $request->validate([
            'kendaraan_id' => 'required|exists:kendaraans,id',
            'catatan' => 'nullable|string',
            'kendala' => 'nullable|array',
            'kendala.*.name' => 'required_with:kendala|string',
            'kendala.*.description' => 'required_with:kendala|string',
        ], [
            'kendaraan_id.required' => 'Kendaraan harus dipilih',
            'kendaraan_id.exists' => 'Kendaraan tidak ditemukan',
        ]);


        $kendaraan = Kendaraan::where('id', $validated['kendaraan_id'])
            ->where('driver_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors([
                'kendaraan_id' => 'Anda tidak memiliki akses ke kendaraan ini.',
            ]);
        }


        Kerusakan::create($validated);


        $kendaraan->status = 'Pengajuan Perbaikan';
        $kendaraan->save();

        return redirect()->route('driver.dashboard')
            ->with('success', 'Laporan kerusakan berhasil dikirim! Status kendaraan telah diubah menjadi "Pengajuan Perbaikan".');
    }

    public function storeFromChat(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'kendaraan_id' => 'required|exists:kendaraans,id',
            'catatan' => 'nullable|string',
            'kendala' => 'required|array|min:1',
            'kendala.*.name' => 'required|string',
            'kendala.*.description' => 'required|string',
        ], [
            'kendaraan_id.required' => 'Kendaraan harus dipilih',
            'kendaraan_id.exists' => 'Kendaraan tidak ditemukan',
            'kendala.required' => 'Kendala harus diisi',
            'kendala.min' => 'Minimal harus ada 1 kendala',
        ]);

        $kendaraan = Kendaraan::where('id', $validated['kendaraan_id'])
            ->where('driver_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors([
                'kendaraan_id' => 'Anda tidak memiliki akses ke kendaraan ini.',
            ]);
        }

        if ($kendaraan->status === 'Pengajuan Perbaikan' || $kendaraan->status === 'Perbaikan' || $kendaraan->status === 'Pending') {
            return back()->withErrors([
                'kendala' => 'Kendaraan Anda sudah memiliki pengajuan perbaikan yang sedang diproses.'
            ]);
        }

        Kerusakan::create($validated);

        $kendaraan->status = 'Pengajuan Perbaikan';
        $kendaraan->save();


        return back()->with('success', 'Kendala berhasil dilaporkan!');
    }

    public function cancel(Request $request)
    {
        $user = Auth::user();


        $validated = $request->validate([
            'kendaraan_id' => 'required|exists:kendaraans,id',
        ]);


        $kendaraan = Kendaraan::where('id', $validated['kendaraan_id'])
            ->where('driver_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors([
                'kendaraan_id' => 'Anda tidak memiliki akses ke kendaraan ini.',
            ]);
        }


        if ($kendaraan->status !== 'Pengajuan Perbaikan') {
            return back()->with('error', 'Pengajuan tidak dapat dibatalkan karena status sudah berubah.');
        }


        Kerusakan::where('kendaraan_id', $kendaraan->id)->delete();


        $kendaraan->status = 'Normal';
        $kendaraan->save();

        return redirect()->route('driver.dashboard')
            ->with('success', 'Pengajuan perbaikan berhasil dibatalkan. Status kendaraan dikembalikan ke Normal.');
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();


        $validated = $request->validate([
            'catatan' => 'nullable|string',
            'kendala' => 'nullable|array',
            'kendala.*.name' => 'required_with:kendala|string',
            'kendala.*.description' => 'required_with:kendala|string',
        ]);

        $kerusakan = Kerusakan::findOrFail($id);


        $kendaraan = Kendaraan::where('id', $kerusakan->kendaraan_id)
            ->where('driver_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors([
                'kendaraan_id' => 'Anda tidak memiliki akses ke kendaraan ini.',
            ]);
        }


        if ($kendaraan->status === 'Perbaikan' || $kendaraan->status === 'Pending') {
            return back()->with('error', 'Kendala tidak dapat diupdate karena status sudah Perbaikan atau Pending.');
        }


        $kerusakan->update([
            'catatan' => $validated['catatan'] ?? $kerusakan->catatan,
            'kendala' => $validated['kendala'] ?? $kerusakan->kendala,
        ]);

        return redirect()->route('driver.dashboard')
            ->with('success', 'Kendala berhasil diupdate!');
    }

    public function approve(Request $request)
    {

        $validated = $request->validate([
            'kerusakan_id' => 'required|exists:kerusakans,id',
            'mekanik_id' => 'required|exists:users,id',
        ]);

        $kerusakan = Kerusakan::findOrFail($validated['kerusakan_id']);


        if ($kerusakan->keruskaanAcc) {
            return redirect()->route('admin.pengajuan-perbaikan')
                ->with('error', 'Kerusakan ini sudah ditugaskan ke mekanik sebelumnya.');
        }

        $kendaraan = Kendaraan::findOrFail($kerusakan->kendaraan_id);


        $mekanik = User::where('id', $validated['mekanik_id'])
            ->where('role', 'Mekanik')
            ->first();

        if (!$mekanik) {
            return redirect()->route('admin.pengajuan-perbaikan')
                ->with('error', 'Mekanik tidak ditemukan.');
        }


        Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id' => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        $kendaraan->status = 'Perbaikan';
        $kendaraan->save();

        return redirect()->route('admin.pengajuan-perbaikan')
            ->with('success', 'Pengajuan perbaikan berhasil disetujui dan ditugaskan ke mekanik!');
    }

    public function index()
    {

        $kerusakans = Kerusakan::with(['kendaraan.driver'])
            ->whereHas('kendaraan', function ($query) {
                $query->where('status', 'Pengajuan Perbaikan');
            })
            ->doesntHave('keruskaanAcc')
            ->latest()
            ->get();


        $mekaniks = User::where('role', 'Mekanik')
            ->where(function ($query) {
                $query->where('status', 'available')
                    ->orWhereNull('status');
            })
            ->select('id', 'username')
            ->get();


        $perbaikans = Keruskaanacc::with(['kerusakan', 'kendaraan.driver', 'mekanik'])
            ->latest()
            ->get();

        return Inertia::render('Admin/PengajuanPerbaikan', [
            'kerusakans' => $kerusakans,
            'mekaniks' => $mekaniks,
            'perbaikans' => $perbaikans,
        ]);
    }
    public function mekanikDashboard()
    {
        $user = Auth::user();

        $kerusakanAcc = Keruskaanacc::with(['kendaraan', 'kerusakan', 'kendaraan.driver'])
            ->where('mekanik_id', $user->id)
            ->whereHas('kendaraan', function ($query) {
                $query->whereIn('status', ['Perbaikan', 'Pending']);
            })
            ->doesntHave('bill')
            ->latest()
            ->get();

        $bills = Bill::with(['keruskaanAcc.kendaraan', 'keruskaanAcc.kerusakan'])
            ->whereHas('keruskaanAcc', function ($query) use ($user) {
                $query->where('mekanik_id', $user->id);
            })
            ->latest()
            ->get();

        return Inertia::render('Mekanik/DashboardMekanik', [
            'keruskaanAcc' => $kerusakanAcc,
            'bills' => $bills,
        ]);
    }
    public function mekanikDetail($id)
    {
        $user = Auth::user();

        $assignment = Keruskaanacc::with(['kendaraan', 'kerusakan', 'kendaraan.driver', 'bill'])
            ->where('id', $id)
            ->where('mekanik_id', $user->id)
            ->firstOrFail();

        if ($assignment->bill) {
            return redirect()->route('mekanik.dashboard')
                ->with('error', 'Bill untuk perbaikan ini sudah dibuat. Tidak dapat mengakses detail lagi.');
        }

        return Inertia::render('Mekanik/DetailKerusakan', [
            'assignment' => $assignment,
        ]);
    }

    public function markAsPending(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'keruskaanacc_id' => 'required|exists:keruskaanaccs,id',
        ]);

        $keruskaanAcc = Keruskaanacc::with('kendaraan')->findOrFail($validated['keruskaanacc_id']);


        if ($keruskaanAcc->mekanik_id !== $user->id) {
            return back()->with('error', 'Unauthorized access.');
        }

        $kendaraan = $keruskaanAcc->kendaraan;
        $kendaraan->status = 'Pending';
        $kendaraan->save();

        return redirect()->route('mekanik.dashboard')
            ->with('success', 'Status kendaraan berhasil diubah menjadi Pending.');
    }
}
