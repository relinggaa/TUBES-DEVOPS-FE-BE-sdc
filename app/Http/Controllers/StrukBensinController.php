<?php

namespace App\Http\Controllers;

use App\Models\StrukBensin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StrukBensinController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $riwayatStruk = StrukBensin::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Driver/UploadBill', [
            'riwayatStruk' => $riwayatStruk
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gambar'      => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'bank'        => ['required', 'string', Rule::in(StrukBensin::BANK_CHOICES)],
            'no_rekening' => ['required', 'string', 'max:64', 'regex:/\S/'],
        ]);

        $user = Auth::user();

        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');
            $gambarPath = $gambar->store('struk_bensin', 'public');

            StrukBensin::create([
                'user_id'     => $user->id,
                'gambar'      => $gambarPath,
                'bank'        => $request->input('bank'),
                'no_rekening' => trim((string) $request->input('no_rekening')),
                'is_accept'   => null,
            ]);

            return redirect()->back()->with('success', 'Struk bensin berhasil diupload!');
        }

        return redirect()->back()->with('error', 'Gagal mengupload struk bensin.');
    }
}
