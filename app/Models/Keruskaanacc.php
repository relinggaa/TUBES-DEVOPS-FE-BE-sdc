<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keruskaanacc extends Model
{
    protected $fillable = [
        'kerusakan_id',
        'mekanik_id',
        'kendaraan_id',
    ];


    public function kerusakan()
    {
        return $this->belongsTo(Kerusakan::class, 'kerusakan_id');
    }


    public function mekanik()
    {
        return $this->belongsTo(User::class, 'mekanik_id');
    }


    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class, 'kendaraan_id');
    }

    public function bill()
    {
        return $this->hasOne(Bill::class, 'keruskaanacc_id');
    }
}
