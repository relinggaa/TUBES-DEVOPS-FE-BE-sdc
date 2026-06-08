<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MekanikAuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check() && Auth::user()->role === 'Mekanik') {
            return redirect()->route('mekanik.dashboard');
        }

        return Inertia::render('Mekanik/LoginMekanik');
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

        if ($user->role !== 'Mekanik') {
            return back()->withErrors([
                'key' => 'Anda tidak memiliki akses sebagai mekanik.',
            ])->withInput($request->only('username'));
        }

        Auth::login($user, $request->has('remember'));
        $request->session()->regenerate();
        
        return redirect()->intended(route('mekanik.dashboard'))
            ->with('success', 'Login berhasil! Selamat datang, ' . $user->username);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('mekanik.login');
         
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

        
        if ($user->gambar && !filter_var($user->gambar, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($user->gambar);
        }

    
        $gambarPath = $request->file('gambar')->store('profile-pictures', 'public');
        $user->gambar = $gambarPath;
        $user->save();

        return back()->with('success', 'Gambar profil berhasil diupdate!');
    }

    public function markAsFull(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'Mekanik') {
            return back()->with('error', 'Unauthorized access.');
        }

   
        $user->status = 'full';
        $user->save();

        return redirect()->route('mekanik.dashboard')
            ->with('success', 'Status berhasil diubah menjadi Full. Anda tidak akan muncul di daftar mekanik yang tersedia.');
    }

    public function markAsAvailable(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'Mekanik') {
            return back()->with('error', 'Unauthorized access.');
        }

        $user->status = 'available';
        $user->save();

        return redirect()->route('mekanik.dashboard')
            ->with('success', 'Status berhasil diubah menjadi Available. Anda akan muncul di daftar mekanik yang tersedia.');
    }
}
