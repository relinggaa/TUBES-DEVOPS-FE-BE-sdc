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
            $table->string('bukti_reimburse')->nullable()->after('is_accept');
            $table->boolean('is_reimburse')->default(false)->after('bukti_reimburse');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('struk_bensins', function (Blueprint $table) {
            $table->dropColumn(['bukti_reimburse', 'is_reimburse']);
        });
    }
};
