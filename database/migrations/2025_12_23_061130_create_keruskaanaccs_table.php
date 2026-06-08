<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('keruskaanaccs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kerusakan_id')->constrained('kerusakans')->onDelete('cascade');
            $table->foreignId('mekanik_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('kendaraan_id')->constrained('kendaraans')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keruskaanaccs');
    }
};
