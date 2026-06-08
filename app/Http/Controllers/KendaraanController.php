<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Database\UniqueConstraintViolationException;

class KendaraanController extends Controller
{
    public function index(Request $request)
    {
        $query = Kendaraan::with('driver')->orderBy('created_at', 'desc');


        if ($request->has('search') && $request->search !== null && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('merek', 'like', '%' . $search . '%')
                    ->orWhere('plat_nomor', 'like', '%' . $search . '%')
                    ->orWhereHas('driver', function ($driverQuery) use ($search) {
                        $driverQuery->where('username', 'like', '%' . $search . '%');
                    });
            });
        }

        $kendaraans = $query->paginate(6)->appends($request->only(['search']));
        $drivers = User::where('role', 'Driver')->select('id', 'username')->get();

        return Inertia::render('Admin/Kendaraan', [
            'kendaraans' => $kendaraans,
            'drivers' => $drivers,
            'filters' => [
                'search' => $request->search ?? ''
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'merek' => 'required|string|max:255',
            'plat_nomor' => 'required|string|max:20|unique:kendaraans,plat_nomor',
            'driver_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('kendaraans', 'driver_id')
            ],
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'plat_nomor.unique' => 'Kendaraan sudah terdaftar.',
            'driver_id.unique' => 'User sudah memiliki kendaraan. Satu user hanya bisa memiliki satu kendaraan.',
        ]);

        try {
            if ($request->hasFile('gambar')) {
                $gambar = $request->file('gambar');
                $gambarPath = $gambar->store('kendaraan', 'public');
                $validated['gambar'] = $gambarPath;
            }

            Kendaraan::create($validated);




            return redirect()->route('kendaraan.index')
                ->with('success', 'Kendaraan berhasil ditambahkan!');
        } catch (UniqueConstraintViolationException $e) {

            if (isset($validated['gambar']) && Storage::disk('public')->exists($validated['gambar'])) {
                Storage::disk('public')->delete($validated['gambar']);
            }

            if (str_contains($e->getMessage(), 'driver_id') || str_contains($e->getMessage(), 'kendaraans_driver_id_unique')) {
                return redirect()->route('kendaraan.index')
                    ->with('error', 'User sudah memiliki kendaraan. Satu user hanya bisa memiliki satu kendaraan.');
            }

            if (str_contains($e->getMessage(), 'plat_nomor') || str_contains($e->getMessage(), 'kendaraans_plat_nomor_unique')) {
                return redirect()->route('kendaraan.index')
                    ->with('error', 'Kendaraan sudah terdaftar.');
            }

            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $kendaraan = Kendaraan::findOrFail($id);

        $validated = $request->validate([
            'merek' => 'required|string|max:255',
            'plat_nomor' => 'required|string|max:20|unique:kendaraans,plat_nomor,' . $id,
            'driver_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('kendaraans', 'driver_id')->ignore($id)
            ],
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'plat_nomor.unique' => 'Kendaraan sudah terdaftar.',
            'driver_id.unique' => 'User sudah memiliki kendaraan. Satu user hanya bisa memiliki satu kendaraan.',
        ]);

        try {
            if ($request->hasFile('gambar')) {
                if ($kendaraan->gambar) {
                    Storage::disk('public')->delete($kendaraan->gambar);
                }
                $gambar = $request->file('gambar');
                $gambarPath = $gambar->store('kendaraan', 'public');
                $validated['gambar'] = $gambarPath;
            }

            $kendaraan->update($validated);

            return redirect()->route('kendaraan.index')
                ->with('success', 'Kendaraan berhasil diupdate!');
        } catch (UniqueConstraintViolationException $e) {

            if (isset($validated['gambar']) && Storage::disk('public')->exists($validated['gambar'])) {
                Storage::disk('public')->delete($validated['gambar']);
            }

            if (str_contains($e->getMessage(), 'driver_id') || str_contains($e->getMessage(), 'kendaraans_driver_id_unique')) {
                return redirect()->route('kendaraan.index')
                    ->with('error', 'User sudah memiliki kendaraan. Satu user hanya bisa memiliki satu kendaraan.');
            }

            if (str_contains($e->getMessage(), 'plat_nomor') || str_contains($e->getMessage(), 'kendaraans_plat_nomor_unique')) {
                return redirect()->route('kendaraan.index')
                    ->with('error', 'Kendaraan sudah terdaftar.');
            }

            throw $e;
        }
    }

    public function destroy($id)
    {
        $kendaraan = Kendaraan::findOrFail($id);

        if ($kendaraan->gambar) {
            Storage::disk('public')->delete($kendaraan->gambar);
        }

        $kendaraan->delete();



        return redirect()->route('kendaraan.index')
            ->with('success', 'Kendaraan berhasil dihapus!');
    }

    public function driverDashboard()
    {
        $user = Auth::user();

      
        $kendaraan = Kendaraan::where('driver_id', $user->id)
            ->with([
                'driver',
                'kerusakans' => function ($query) {
                    $query->latest()->first(); 
                }
            ])
            ->first();

        
        $latestKerusakan = null;
        if ($kendaraan) {
            $latestKerusakan = $kendaraan->kerusakans()->latest()->first();
        }

        return Inertia::render('Driver/DashboardDriver', [
            'kendaraan' => $kendaraan,
            'kerusakan' => $latestKerusakan
        ]);
    }

    public function driverReport()
    {
        $user = Auth::user();

     
        $kendaraan = Kendaraan::where('driver_id', $user->id)
            ->with('driver')
            ->first();

        return Inertia::render('Driver/ReportDriver', [
            'kendaraan' => $kendaraan
        ]);
    }

    public function driverTanyaAI()
    {
        $user = Auth::user();

        $kendaraan = Kendaraan::where('driver_id', $user->id)
            ->with([
                'driver',
                'kerusakans' => function ($query) {
                    $query->latest()->first(); 
                }
            ])
            ->first();

       
        $latestKerusakan = null;
        if ($kendaraan) {
            $latestKerusakan = $kendaraan->kerusakans()->latest()->first();
        }

        return Inertia::render('Driver/SagaraAI', [
            'kendaraan' => $kendaraan,
            'kerusakan' => $latestKerusakan
        ]);
    }

    public function mekanikTanyaAI()
    {
        $user = Auth::user();

        $keruskaanAcc = \App\Models\Keruskaanacc::with(['kendaraan', 'kerusakan', 'kendaraan.driver'])
            ->where('mekanik_id', $user->id)
            ->whereHas('kendaraan', function ($query) {
                $query->whereIn('status', ['Perbaikan', 'Pending']);
            })
            ->doesntHave('bill')
            ->latest()
            ->get();

        return Inertia::render('Mekanik/SagaraAI', [
            'keruskaanAcc' => $keruskaanAcc
        ]);
    }
}
