<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Kerusakan;
use App\Models\Bill;
use App\Models\Keruskaanacc;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminAuthController extends Controller
{
    public function showLoginForm()
    {
       
        if (Auth::check() && Auth::user()->role === 'Admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/LoginAdmin');
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'key' => 'required|string|size:8',
        ], [
            'username.required' => 'Username harus diisi',
            'key.required' => 'Key harus diisi',
            'key.size' => 'Key harus terdiri dari 8 karakter',
        ]);

    
        $user = User::where('username', $validated['username'])
            ->where('key', strtoupper($validated['key']))
            ->first();

       
        if (!$user) {
            return back()->withErrors([
                'key' => 'Username atau key tidak valid.',
            ])->withInput($request->only('username'));
        }

  
        if ($user->role !== 'Admin') {
            return back()->withErrors([
                'key' => 'Anda tidak memiliki akses sebagai admin.',
            ])->withInput($request->only('username'));
        }


        Auth::login($user, $request->has('remember'));
        $request->session()->regenerate();
        return redirect()->intended(route('admin.dashboard'))
            ->with('success', 'Login berhasil! Selamat datang, ' . $user->username);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')
            ->with('success', 'Anda telah logout.');
    }

    public function updateGambar(Request $request)
    {
        $request->validate([
            'gambar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'gambar.required' => 'Gambar harus diisi',
            'gambar.image' => 'File harus berupa gambar',
            'gambar.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif',
            'gambar.max' => 'Ukuran gambar maksimal 2MB',
        ]);

        $user = Auth::user();

       
        if ($user->gambar && strpos($user->gambar, 'http') !== 0) {
            Storage::disk('public')->delete($user->gambar);
        }

        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');
            $gambarPath = $gambar->store('users', 'public');
            $user->gambar = $gambarPath;
            $user->save();
        }

        return redirect()->back()
            ->with('success', 'Foto profil berhasil diupdate!');
    }

    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ], [
            'logo.required' => 'File logo harus diisi',
            'logo.image'   => 'File harus berupa gambar',
            'logo.mimes'   => 'Logo harus berformat jpeg, png, jpg, gif, svg, atau webp',
            'logo.max'     => 'Ukuran logo maksimal 2MB',
        ]);

        // Hapus logo lama jika ada
        $oldLogo = AppSetting::get('logo');
        if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
            Storage::disk('public')->delete($oldLogo);
        }

        $path = $request->file('logo')->store('logos', 'public');
        AppSetting::set('logo', $path);

        return redirect()->back()->with('success', 'Logo berhasil diupdate!');
    }

    public function resetLogo()
    {
        $oldLogo = AppSetting::get('logo');
        if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
            Storage::disk('public')->delete($oldLogo);
        }

        AppSetting::set('logo', null);

        return redirect()->back()->with('success', 'Logo berhasil direset ke default!');
    }

    public function dashboard()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        
        $totalPengajuan = Kerusakan::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();


        $perbaikanSelesai = Bill::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();


        $pendingReview = Kerusakan::whereDoesntHave('keruskaanAcc')
            ->whereHas('kendaraan', function($q) {
                $q->where('status', 'Pengajuan Perbaikan');
            })
            ->count();

  
        $totalBiaya = Bill::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_biaya');

       
        $totalBiayaFormatted = $totalBiaya >= 1000000 
            ? number_format($totalBiaya / 1000000, 0) . '+' 
            : number_format($totalBiaya / 1000, 0) . 'K';
        $totalBiayaDescription = $totalBiaya >= 1000000 
            ? 'Jutaan rupiah bulan ini' 
            : 'Ribu rupiah bulan ini';

        $recentActivities = [];
        
        $recentKerusakan = Kerusakan::with(['kendaraan', 'keruskaanAcc'])
            ->latest()
            ->get();
        
        foreach ($recentKerusakan as $kerusakan) {
            $timeAgo = $kerusakan->created_at->diffForHumans();
            $kendaraan = $kerusakan->kendaraan;
            
            if ($kerusakan->keruskaanAcc) {
                $recentActivities[] = [
                    'id' => 'kerusakan-' . $kerusakan->id,
                    'activity' => "Perbaikan {$kendaraan->merek} ({$kendaraan->plat_nomor}) telah disetujui",
                    'time' => $timeAgo,
                    'type' => 'success',
                    'created_at' => $kerusakan->created_at->timestamp,
                    'route' => route('admin.pengajuan-perbaikan')
                ];
            } else {
                $recentActivities[] = [
                    'id' => 'kerusakan-' . $kerusakan->id,
                    'activity' => "Pengajuan perbaikan baru: {$kendaraan->merek} ({$kendaraan->plat_nomor})",
                    'time' => $timeAgo,
                    'type' => 'info',
                    'created_at' => $kerusakan->created_at->timestamp,
                    'route' => route('admin.pengajuan-perbaikan')
                ];
            }
        }

        $recentBills = Bill::with(['keruskaanAcc.kendaraan'])
            ->latest()
            ->get();
        
        foreach ($recentBills as $bill) {
            $timeAgo = $bill->created_at->diffForHumans();
            $kendaraan = $bill->keruskaanAcc->kendaraan;
            
            $recentActivities[] = [
                'id' => 'bill-' . $bill->id,
                'activity' => "Laporan biaya untuk {$kendaraan->merek} ({$kendaraan->plat_nomor}) telah dibuat",
                'time' => $timeAgo,
                'type' => 'info',
                'created_at' => $bill->created_at->timestamp,
                'route' => route('admin.laporan-biaya')
            ];
        }

      
        usort($recentActivities, function($a, $b) {
            return $b['created_at'] - $a['created_at'];
        });


        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $startOfDay = $date->copy()->startOfDay();
            $endOfDay = $date->copy()->endOfDay();
            
            $pengajuanCount = Kerusakan::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->count();
            
            $chartData[] = [
                'date' => $date->format('d M'),
                'pengajuan' => $pengajuanCount
            ];
        }

        return Inertia::render('Admin/DashboardAdmin', [
            'stats' => [
                [
                    'title' => 'Total Pengajuan',
                    'value' => (string)$totalPengajuan,
                    'description' => 'Pengajuan yang masuk bulan ini',
                ],
                [
                    'title' => 'Perbaikan Selesai',
                    'value' => (string)$perbaikanSelesai,
                    'description' => 'Perbaikan yang telah diselesaikan',
                ],
                [
                    'title' => 'Pending Review',
                    'value' => (string)$pendingReview,
                    'description' => 'Menunggu persetujuan',
                ],
                [
                    'title' => 'Total Biaya',
                    'value' => $totalBiayaFormatted,
                    'description' => $totalBiayaDescription,
                ],
            ],
            'recentActivities' => $recentActivities,
            'chartData' => $chartData,
        ]);
    }
}

