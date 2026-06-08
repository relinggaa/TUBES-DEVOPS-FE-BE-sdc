<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriverAuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check() && Auth::user()->role === 'Driver') {
            return redirect()->route('driver.dashboard');
        }

        return Inertia::render('Driver/LoginDriver');
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

        if ($user->role !== 'Driver') {
            return back()->withErrors([
                'key' => 'Anda tidak memiliki akses sebagai driver.',
            ])->withInput($request->only('username'));
        }

        Auth::login($user, $request->has('remember'));
        $request->session()->regenerate();
        
        return redirect()->intended(route('driver.dashboard'))
            ->with('success', 'Login berhasil! Selamat datang, ' . $user->username);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('driver.login')
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

        // Hapus gambar lama jika ada
        if ($user->gambar) {
            Storage::disk('public')->delete($user->gambar);
        }

        // Simpan gambar baru
        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');
            $gambarPath = $gambar->store('users', 'public');
            $user->gambar = $gambarPath;
            $user->save();
        }

        return redirect()->route('driver.dashboard')
            ->with('success', 'Foto profil berhasil diupdate!');
    }
}

