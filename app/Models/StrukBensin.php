<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StrukBensin extends Model
{
    /** Daftar bank / e-wallet yang dipilih di form driver. */
    public const BANK_CHOICES = [
        'BRI',
        'BCA',
        'BNI',
        'MANDIRI',
        'GOPAY',
        'DANA',
        'SHOPEE PAY',
    ];

    protected $fillable = [
        'user_id',
        'gambar',
        'bank',
        'no_rekening',
        'is_accept',
        'bukti_reimburse',
        'is_reimburse',
    ];

    protected $casts = [
        'is_accept'    => 'boolean',
        'is_reimburse' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
