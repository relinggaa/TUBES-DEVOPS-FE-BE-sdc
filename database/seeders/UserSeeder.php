<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['username' => 'ahmad.rizki', 'role' => 'Admin', 'key' => 'A1B2C3D4'],
            ['username' => 'budi.santoso', 'role' => 'Mekanik', 'key' => 'E5F6G7H8'],
            ['username' => 'cindy.wijaya', 'role' => 'Driver', 'key' => 'I9J0K1L2'],
            ['username' => 'dedi.pratama', 'role' => 'Admin', 'key' => 'M3N4O5P6'],
            ['username' => 'eka.sari', 'role' => 'Mekanik', 'key' => 'Q7R8S9T0'],
            ['username' => 'fajar.nugroho', 'role' => 'Driver', 'key' => 'U1V2W3X4'],
            ['username' => 'gita.permata', 'role' => 'Admin', 'key' => 'Y5Z6A7B8'],
            ['username' => 'hadi.kurniawan', 'role' => 'Mekanik', 'key' => 'C9D0E1F2'],
            ['username' => 'indra.setiawan', 'role' => 'Driver', 'key' => 'G3H4I5J6'],
            ['username' => 'joko.widodo', 'role' => 'Admin', 'key' => 'K7L8M9N0'],
            ['username' => 'kartika.dewi', 'role' => 'Mekanik', 'key' => 'O1P2Q3R4'],
            ['username' => 'lukman.hakim', 'role' => 'Driver', 'key' => 'S5T6U7V8'],
            ['username' => 'maya.sari', 'role' => 'Admin', 'key' => 'W9X0Y1Z2'],
            ['username' => 'nur.hidayat', 'role' => 'Mekanik', 'key' => 'A3B4C5D6'],
            ['username' => 'oki.setiawan', 'role' => 'Driver', 'key' => 'E7F8G9H0'],
            ['username' => 'putri.lestari', 'role' => 'Admin', 'key' => 'I1J2K3L4'],
            ['username' => 'rizki.pratama', 'role' => 'Mekanik', 'key' => 'M5N6O7P8'],
            ['username' => 'sari.indah', 'role' => 'Driver', 'key' => 'Q9R0S1T2'],
            ['username' => 'tono.wijaya', 'role' => 'Admin', 'key' => 'U3V4W5X6'],
            ['username' => 'umi.kalsum', 'role' => 'Mekanik', 'key' => 'Y7Z8A9B0'],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
