<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            // Menambahkan unique constraint pada driver_id untuk memastikan one-to-one relationship
            // Satu user hanya bisa menjadi driver untuk satu kendaraan
            $table->unique('driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            $table->dropUnique(['driver_id']);
        });
    }
};
