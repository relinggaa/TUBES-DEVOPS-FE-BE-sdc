<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Towing extends Model
{
    protected $fillable = [
        'driver_id',
        'lokasi',
        'latitude',
        'longitude',
        'keterangan',
        'status',
        'isproses',
    ];

    protected $casts = [
        'isproses' => 'boolean',
        'latitude'  => 'float',
        'longitude' => 'float',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
