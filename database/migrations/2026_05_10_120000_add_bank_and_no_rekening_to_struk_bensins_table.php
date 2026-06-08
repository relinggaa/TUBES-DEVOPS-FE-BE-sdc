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
        Schema::table('struk_bensins', function (Blueprint $table) {
            $table->string('bank', 32)->nullable()->after('gambar');
            $table->string('no_rekening', 64)->nullable()->after('bank');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('struk_bensins', function (Blueprint $table) {
            $table->dropColumn(['bank', 'no_rekening']);
        });
    }
};
