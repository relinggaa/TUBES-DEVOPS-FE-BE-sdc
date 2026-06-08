<?php

namespace App\Http\Controllers;

use App\Models\StrukBensin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BensinController extends Controller
{
    /* ─────────────────────────────────────────────
     *  DRIVER
     * ───────────────────────────────────────────── */

    public function index(Request $request)
    {
        $user = Auth::user();

        $riwayatStruk = StrukBensin::where('user_id', $user->id)
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Driver/UploadBill', [
            'riwayatStruk' => $riwayatStruk,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gambar'      => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'bank'        => ['required', 'string', Rule::in(StrukBensin::BANK_CHOICES)],
            'no_rekening' => ['required', 'string', 'max:64', 'regex:/\S/'],
        ], [
            'bank.required'        => 'Pilih bank atau e-wallet tujuan refund.',
            'bank.in'              => 'Bank/e-wallet tidak valid.',
            'no_rekening.required' => 'Nomor rekening atau nomor e-wallet wajib diisi.',
            'no_rekening.regex'    => 'Nomor rekening / e-wallet tidak boleh hanya spasi.',
        ]);

        $user = Auth::user();

        if (!$request->hasFile('gambar')) {
            return back()->with('error', 'Gagal mengupload struk bensin.');
        }

        $gambarPath = $request->file('gambar')->store('struk_bensin', 'public');

        StrukBensin::create([
            'user_id'     => $user->id,
            'gambar'      => $gambarPath,
            'bank'        => $request->input('bank'),
            'no_rekening' => trim($request->input('no_rekening')),
            'is_accept'   => null,
        ]);

        return back()->with('success', 'Struk bensin berhasil diupload!');
    }

    public function cancel(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'struk_bensin_id' => 'required|exists:struk_bensins,id',
        ]);

        $struk = StrukBensin::where('id', $validated['struk_bensin_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$struk) {
            return back()->with('error', 'Pengajuan struk bensin tidak ditemukan.');
        }

        if (!is_null($struk->is_accept)) {
            return back()->with('error', 'Pengajuan tidak bisa dibatalkan karena sudah diproses.');
        }

        $struk->delete();

        return back()->with('success', 'Pengajuan struk bensin berhasil dibatalkan.');
    }

    /* ─────────────────────────────────────────────
     *  ADMIN
     * ───────────────────────────────────────────── */

    /**
     * Tampilkan semua struk bensin untuk admin dengan pagination & search.
     */
    public function adminIndex(Request $request)
    {
        $search = $request->input('search', '');

        $query = StrukBensin::with('user')->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($sq) use ($search) {
                    $sq->where('username', 'like', "%{$search}%")
                       ->orWhere('name', 'like', "%{$search}%");
                })->orWhere('bank', 'like', "%{$search}%")
                  ->orWhere('no_rekening', 'like', "%{$search}%");
            });
        }

        $struks = $query->paginate(5)->withQueryString();

        return Inertia::render('Admin/LaporanBensin', [
            'struks'  => $struks,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Admin menyelesaikan reimburse dengan mengunggah bukti.
     */
    public function adminReimburse(Request $request)
    {
        $request->validate([
            'struk_bensin_id'  => 'required|exists:struk_bensins,id',
            'bukti_reimburse'  => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $struk = StrukBensin::findOrFail($request->input('struk_bensin_id'));

        if ($struk->is_reimburse) {
            return back()->with('error', 'Reimburse sudah diselesaikan sebelumnya.');
        }

        $buktiPath = $request->file('bukti_reimburse')->store('bukti_reimburse', 'public');

        $struk->update([
            'bukti_reimburse' => $buktiPath,
            'is_reimburse'    => true,
        ]);

        return back()->with('success', 'Reimburse berhasil diselesaikan!');
    }
}
