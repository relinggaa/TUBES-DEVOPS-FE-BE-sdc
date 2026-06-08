<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'keruskaanacc_id',
        'detail_biaya',
        'total_biaya',
        'bukti_bill',
    ];

    protected $casts = [
        'detail_biaya' => 'array',
        'total_biaya' => 'decimal:2',
    ];

    public function keruskaanAcc()
    {
        return $this->belongsTo(Keruskaanacc::class, 'keruskaanacc_id');
    }
}
