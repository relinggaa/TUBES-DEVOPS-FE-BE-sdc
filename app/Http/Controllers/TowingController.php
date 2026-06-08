<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\Kerusakan;
use App\Models\Towing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TowingController extends Controller
{
    /**
     * Tampilkan halaman request towing beserta history & active towing driver.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Towing yang sedang aktif (Pending atau Diproses)
        $activeTowing = Towing::where('driver_id', $user->id)
            ->whereIn('status', ['Pending', 'Diproses'])
            ->latest()
            ->first();

        // Riwayat towing driver (pagination, urut terbaru)
        $riwayatTowing = Towing::where('driver_id', $user->id)
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Driver/RequestTowing', [
            'activeTowing'  => $activeTowing,
            'riwayatTowing' => $riwayatTowing,
        ]);
    }

    /**
     * Buat pengajuan towing baru.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Cek apakah driver sudah punya towing aktif
        $existingActive = Towing::where('driver_id', $user->id)
            ->whereIn('status', ['Pending', 'Diproses'])
            ->first();

        if ($existingActive) {
            return back()->with('error', 'Anda masih memiliki pengajuan towing yang aktif. Batalkan terlebih dahulu sebelum mengajukan yang baru.');
        }

        $validated = $request->validate([
            'lokasi'    => 'required|string|max:1000',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'keterangan'=> 'nullable|string|max:500',
        ], [
            'lokasi.required' => 'Lokasi harus diisi.',
        ]);

        Towing::create([
            'driver_id'  => $user->id,
            'lokasi'     => $validated['lokasi'],
            'latitude'   => $validated['latitude'] ?? null,
            'longitude'  => $validated['longitude'] ?? null,
            'keterangan' => $validated['keterangan'] ?? null,
            'status'     => 'Pending',
            'isproses'   => false,
        ]);

        return back()->with('success', 'Pengajuan towing berhasil dikirim! Silakan tunggu konfirmasi.');
    }

    /**
     * Batalkan pengajuan towing (hanya jika isproses = false).
     */
    public function cancel(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'towing_id' => 'required|exists:towings,id',
        ]);

        $towing = Towing::where('id', $validated['towing_id'])
            ->where('driver_id', $user->id)
            ->first();

        if (!$towing) {
            return back()->with('error', 'Pengajuan towing tidak ditemukan.');
        }

        if ($towing->isproses) {
            return back()->with('error', 'Pengajuan towing tidak dapat dibatalkan karena sedang dalam proses.');
        }

        if (!in_array($towing->status, ['Pending', 'Diproses'])) {
            return back()->with('error', 'Pengajuan towing tidak dapat dibatalkan dengan status saat ini.');
        }

        $towing->delete();

        return back()->with('success', 'Pengajuan towing berhasil dibatalkan.');
    }

    /**
     * Daftar pengajuan towing untuk admin (pencarian & pagination di server).
     */
    public function adminIndex(Request $request)
    {
        $query = Towing::query()
            ->with(['driver:id,username'])
            ->latest();

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $needle = '%' . addcslashes($search, '\\%_') . '%';

            $query->where(function (Builder $q) use ($needle) {
                $q->where('lokasi', 'like', $needle)
                    ->orWhere('keterangan', 'like', $needle)
                    ->orWhere('status', 'like', $needle)
                    ->orWhereHas('driver', function ($dq) use ($needle) {
                        $dq->where('username', 'like', $needle);
                    });
            });
        }

        return Inertia::render('Driver/TowingAdmin', [
            'towings' => $query->paginate(5)->withQueryString(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Perbarui status towing: Pending → Diproses, Diproses → Selesai.
     */
    public function adminUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'towing_id' => 'required|exists:towings,id',
            'action'    => 'required|in:process,complete',
        ]);

        $towing = Towing::findOrFail((int) $validated['towing_id']);

        if ($validated['action'] === 'process') {
            if ($towing->status !== 'Pending') {
                return back()->with('error', 'Hanya pengajuan berstatus Pending yang dapat ditandai Diproses.');
            }

            $towing->update([
                'status'   => 'Diproses',
                'isproses' => true,
            ]);

            $this->syncKendaraanWithTowingProcessed($towing);

            return back()->with('success', 'Status diperbarui menjadi Diproses. Status kendaraan driver diselaraskan ke pengajuan perbaikan.');
        }

        if ($validated['action'] === 'complete') {
            if ($towing->status !== 'Diproses') {
                return back()->with('error', 'Hanya pengajuan Diproses yang dapat diselesai.');
            }

            $towing->update(['status' => 'Selesai']);

            return back()->with('success', 'Pengajuan towing telah ditandai selesai.');
        }

        return back()->with('error', 'Aksi tidak dikenali.');
    }

    /**
     * Saat towing Diproses: set kendaraan driver menjadi Pengajuan Perbaikan dan catat kerusakan
     * dengan kendala dari lokasi & keterangan towing (ditampilkan di dashboard driver).
     */
    protected function syncKendaraanWithTowingProcessed(Towing $towing): void
    {
        $kendaraan = Kendaraan::where('driver_id', $towing->driver_id)->first();
        if (! $kendaraan) {
            return;
        }

        if (in_array($kendaraan->status, ['Perbaikan', 'Pending'], true)) {
            return;
        }

        $descriptionLines = ['Permintaan towing sedang diproses oleh admin.'];
        if ($towing->lokasi !== null && trim((string) $towing->lokasi) !== '') {
            $descriptionLines[] = 'Lokasi: ' . trim((string) $towing->lokasi);
        }
        if ($towing->keterangan !== null && trim((string) $towing->keterangan) !== '') {
            $descriptionLines[] = 'Keterangan: ' . trim((string) $towing->keterangan);
        }
        $latLng = '';
        if ($towing->latitude !== null && $towing->longitude !== null) {
            $latLng = sprintf(
                '%s, %s',
                round((float) $towing->latitude, 5),
                round((float) $towing->longitude, 5)
            );
            $descriptionLines[] = 'Koordinat: ' . $latLng;
        }
        $description = implode("\n", $descriptionLines);

        $kendalaItem = [
            'name'        => 'Pengajuan Towing',
            'description' => $description,
        ];

        $catatanParts = [];
        if ($towing->keterangan !== null && trim((string) $towing->keterangan) !== '') {
            $catatanParts[] = trim((string) $towing->keterangan);
        }
        if ($towing->lokasi !== null && trim((string) $towing->lokasi) !== '') {
            $catatanParts[] = 'Lokasi penjemputan: ' . trim((string) $towing->lokasi);
        }
        $catatan = implode("\n\n", $catatanParts) ?: 'Pengajuan towing sedang ditangani.';

        if ($kendaraan->status === 'Normal') {
            Kerusakan::create([
                'kendaraan_id' => $kendaraan->id,
                'catatan'      => $catatan,
                'kendala'      => [$kendalaItem],
            ]);
            $kendaraan->forceFill(['status' => 'Pengajuan Perbaikan'])->save();

            return;
        }

        if ($kendaraan->status === 'Pengajuan Perbaikan') {
            $latest = $kendaraan->kerusakans()->latest()->first();
            if ($latest !== null) {
                $merged = array_values(array_merge((array) ($latest->kendala ?? []), [$kendalaItem]));
                $existingCatatan = trim((string) ($latest->catatan ?? ''));
                $separator = ($existingCatatan !== '' ? "\n\n" : '');
                $latest->forceFill([
                    'kendala' => $merged,
                    'catatan' => $existingCatatan . $separator . "[Pengajuan Towing]\n" . $catatan,
                ])->save();
            } else {
                Kerusakan::create([
                    'kendaraan_id' => $kendaraan->id,
                    'catatan'      => $catatan,
                    'kendala'      => [$kendalaItem],
                ]);
            }
        }
    }
}
