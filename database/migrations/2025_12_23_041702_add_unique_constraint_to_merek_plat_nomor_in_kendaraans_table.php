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
            // Hapus unique constraint pada plat_nomor saja
            $table->dropUnique(['plat_nomor']);
            
            // Tambahkan composite unique constraint pada kombinasi merek dan plat_nomor
            $table->unique(['merek', 'plat_nomor'], 'kendaraans_merek_plat_nomor_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kendaraans', function (Blueprint $table) {
            // Hapus composite unique constraint
            $table->dropUnique('kendaraans_merek_plat_nomor_unique');
            
            // Kembalikan unique constraint pada plat_nomor saja
            $table->unique('plat_nomor');
        });
    }
};
