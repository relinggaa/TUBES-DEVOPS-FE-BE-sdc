<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE kendaraans MODIFY COLUMN status ENUM('Normal', 'Pengajuan Perbaikan', 'Perbaikan', 'Pending') DEFAULT 'Normal'");
            return;
        }

        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::statement("
                CREATE TABLE kendaraans_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    merek VARCHAR NOT NULL,
                    plat_nomor VARCHAR NOT NULL,
                    driver_id INTEGER,
                    gambar VARCHAR,
                    status VARCHAR CHECK (status IN ('Normal', 'Pengajuan Perbaikan', 'Perbaikan', 'Pending')) NOT NULL DEFAULT 'Normal',
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY(driver_id) REFERENCES users(id) ON DELETE SET NULL
                )
            ");

            DB::statement("
                INSERT INTO kendaraans_new (id, merek, plat_nomor, driver_id, gambar, status, created_at, updated_at)
                SELECT id, merek, plat_nomor, driver_id, gambar, status, created_at, updated_at
                FROM kendaraans
            ");

            DB::statement('DROP TABLE kendaraans');
            DB::statement('ALTER TABLE kendaraans_new RENAME TO kendaraans');
            DB::statement('CREATE UNIQUE INDEX kendaraans_plat_nomor_unique ON kendaraans (plat_nomor)');
            DB::statement('CREATE INDEX kendaraans_driver_id_foreign ON kendaraans (driver_id)');

            DB::statement('PRAGMA foreign_keys = ON');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE kendaraans MODIFY COLUMN status ENUM('Normal', 'Pengajuan Perbaikan', 'Perbaikan') DEFAULT 'Normal'");
            return;
        }

        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::statement("
                CREATE TABLE kendaraans_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    merek VARCHAR NOT NULL,
                    plat_nomor VARCHAR NOT NULL,
                    driver_id INTEGER,
                    gambar VARCHAR,
                    status VARCHAR CHECK (status IN ('Normal', 'Pengajuan Perbaikan', 'Perbaikan')) NOT NULL DEFAULT 'Normal',
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY(driver_id) REFERENCES users(id) ON DELETE SET NULL
                )
            ");

            DB::statement("
                INSERT INTO kendaraans_new (id, merek, plat_nomor, driver_id, gambar, status, created_at, updated_at)
                SELECT id, merek, plat_nomor, driver_id, gambar,
                    CASE WHEN status = 'Pending' THEN 'Perbaikan' ELSE status END,
                    created_at, updated_at
                FROM kendaraans
            ");

            DB::statement('DROP TABLE kendaraans');
            DB::statement('ALTER TABLE kendaraans_new RENAME TO kendaraans');
            DB::statement('CREATE UNIQUE INDEX kendaraans_plat_nomor_unique ON kendaraans (plat_nomor)');
            DB::statement('CREATE INDEX kendaraans_driver_id_foreign ON kendaraans (driver_id)');

            DB::statement('PRAGMA foreign_keys = ON');
        }
    }
};
