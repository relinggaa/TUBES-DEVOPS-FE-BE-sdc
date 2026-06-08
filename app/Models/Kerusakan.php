<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kerusakan extends Model
{
    protected $fillable = [
        'kendaraan_id',
        'catatan',
        'kendala',
    ];

    protected $casts = [
        'kendala' => 'array',
    ];


    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class, 'kendaraan_id');
    }

    public function keruskaanAcc()
    {
        return $this->hasOne(Keruskaanacc::class, 'kerusakan_id');
    }
}
