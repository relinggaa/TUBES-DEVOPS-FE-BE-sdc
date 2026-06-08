<?php

namespace Tests\Feature;

use App\Models\Kendaraan;
use App\Models\Kerusakan;
use App\Models\Towing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for TowingController.
 * Methods: index, store, cancel, adminIndex, adminUpdateStatus
 */
class TowingControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function makeDriver(array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'drv_' . uniqid(),
            'role'     => 'Driver',
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    private function makeAdmin(array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'adm_' . uniqid(),
            'role'     => 'Admin',
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    /**
     * Buat towing record untuk driver tertentu.
     */
    private function createTowing(User $driver, array $extra = []): Towing
    {
        return Towing::create(array_merge([
            'driver_id'  => $driver->id,
            'lokasi'     => 'Jl. Sudirman No. 1, Jakarta',
            'latitude'   => -6.2088,
            'longitude'  => 106.8456,
            'keterangan' => null,
            'status'     => 'Pending',
            'isproses'   => false,
        ], $extra));
    }

    private function createKendaraan(User $driver, array $extra = []): Kendaraan
    {
        return Kendaraan::create(array_merge([
            'merek'      => 'Test',
            'plat_nomor' => 'B' . substr(uniqid('', true), -8),
            'driver_id'  => $driver->id,
            'status'     => 'Normal',
        ], $extra));
    }

    // =========================================================================
    // index (driver.towing)
    // =========================================================================

    /** [HAPPY PATH] Driver dapat mengakses halaman towing dan mendapat data yang benar. */
    public function test_index_renders_for_driver(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->get(route('driver.towing'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Driver/RequestTowing')
                ->has('activeTowing')
                ->has('riwayatTowing')
            );
    }

    /** [HAPPY PATH] activeTowing berisi towing dengan status Pending milik driver. */
    public function test_index_returns_active_towing_when_pending_exists(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Pending']);

        $this->actingAs($driver)
            ->get(route('driver.towing'))
            ->assertInertia(fn ($page) => $page
                ->where('activeTowing.id', $towing->id)
                ->where('activeTowing.status', 'Pending')
            );
    }

    /** [HAPPY PATH] activeTowing berisi towing dengan status Diproses milik driver. */
    public function test_index_returns_active_towing_when_diproses_exists(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Diproses']);

        $this->actingAs($driver)
            ->get(route('driver.towing'))
            ->assertInertia(fn ($page) => $page
                ->where('activeTowing.id', $towing->id)
                ->where('activeTowing.status', 'Diproses')
            );
    }

    /** [HAPPY PATH] activeTowing null jika tidak ada towing aktif. */
    public function test_index_returns_null_active_towing_when_none(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->get(route('driver.towing'))
            ->assertInertia(fn ($page) => $page
                ->where('activeTowing', null)
            );
    }

    /** [HAPPY PATH] riwayatTowing mengembalikan semua towing milik driver. */
    public function test_index_returns_all_towing_history(): void
    {
        $driver = $this->makeDriver();
        $this->createTowing($driver, ['status' => 'Selesai']);
        $this->createTowing($driver, ['status' => 'Dibatalkan']);
        $this->createTowing($driver, ['status' => 'Pending']);

        $this->actingAs($driver)
            ->get(route('driver.towing'))
            ->assertInertia(fn ($page) => $page
                ->where('riwayatTowing.total', 3)
                ->has('riwayatTowing.data', 3)
            );
    }

    /** [UNAUTHORIZED] Guest diredirect ke halaman login driver. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('driver.towing'))->assertStatus(302);
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa mengakses halaman towing driver. */
    public function test_index_blocked_for_non_driver(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)
            ->get(route('driver.towing'))
            ->assertStatus(302);
    }

    /** [EDGE CASE] riwayatTowing hanya milik driver yang login, bukan driver lain. */
    public function test_index_only_shows_own_towing_history(): void
    {
        $driver1 = $this->makeDriver();
        $driver2 = $this->makeDriver();

        $this->createTowing($driver1);
        $this->createTowing($driver2);

        $this->actingAs($driver1)
            ->get(route('driver.towing'))
            ->assertInertia(fn ($page) => $page
                ->where('riwayatTowing.total', 1)
                ->has('riwayatTowing.data', 1)
            );
    }

    // =========================================================================
    // store (driver.towing.store)
    // =========================================================================

    /** [HAPPY PATH] Driver berhasil mengajukan towing baru. */
    public function test_store_creates_towing_successfully(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi'     => 'Jl. Gatot Subroto No. 12, Jakarta',
                'latitude'   => -6.2300,
                'longitude'  => 106.8200,
                'keterangan' => 'Ban kempis di tengah jalan',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('towings', [
            'driver_id' => $driver->id,
            'lokasi'    => 'Jl. Gatot Subroto No. 12, Jakarta',
            'status'    => 'Pending',
            'isproses'  => false,
        ]);
    }

    /** [HAPPY PATH] Towing berhasil dibuat tanpa latitude, longitude, dan keterangan. */
    public function test_store_creates_towing_without_optional_fields(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Bundaran HI, Jakarta',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('towings', [
            'driver_id' => $driver->id,
            'lokasi'    => 'Bundaran HI, Jakarta',
            'latitude'  => null,
            'longitude' => null,
            'status'    => 'Pending',
        ]);
    }

    /** [VALIDATION] Gagal jika lokasi tidak diisi. */
    public function test_store_fails_without_lokasi(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'keterangan' => 'Ban kempis',
            ])
            ->assertSessionHasErrors('lokasi');
    }

    /** [VALIDATION] Gagal jika lokasi melebihi 1000 karakter. */
    public function test_store_fails_when_lokasi_too_long(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => str_repeat('a', 1001),
            ])
            ->assertSessionHasErrors('lokasi');
    }

    /** [VALIDATION] Gagal jika latitude bukan angka. */
    public function test_store_fails_when_latitude_is_not_numeric(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi'   => 'Jl. Test',
                'latitude' => 'bukan-angka',
            ])
            ->assertSessionHasErrors('latitude');
    }

    /** [VALIDATION] Gagal jika keterangan melebihi 500 karakter. */
    public function test_store_fails_when_keterangan_too_long(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi'     => 'Jl. Test',
                'keterangan' => str_repeat('k', 501),
            ])
            ->assertSessionHasErrors('keterangan');
    }

    /** [EDGE CASE] Driver tidak bisa membuat towing baru jika masih ada yang berstatus Pending. */
    public function test_store_fails_when_active_pending_towing_exists(): void
    {
        $driver = $this->makeDriver();
        $this->createTowing($driver, ['status' => 'Pending']);

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Jl. Baru',
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('towings', 1);
    }

    /** [EDGE CASE] Driver tidak bisa membuat towing baru jika masih ada yang berstatus Diproses. */
    public function test_store_fails_when_active_diproses_towing_exists(): void
    {
        $driver = $this->makeDriver();
        $this->createTowing($driver, ['status' => 'Diproses']);

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Jl. Baru',
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('towings', 1);
    }

    /** [HAPPY PATH] Driver bisa mengajukan towing baru jika towing sebelumnya sudah Selesai. */
    public function test_store_succeeds_when_previous_towing_is_selesai(): void
    {
        $driver = $this->makeDriver();
        $this->createTowing($driver, ['status' => 'Selesai']);

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Jl. Baru Lagi',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseCount('towings', 2);
    }

    /** [UNAUTHORIZED] Guest tidak bisa membuat towing. */
    public function test_store_requires_auth(): void
    {
        $this->post(route('driver.towing.store'), [
            'lokasi' => 'Jl. Merdeka',
        ])->assertStatus(302);

        $this->assertDatabaseCount('towings', 0);
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa membuat towing. */
    public function test_store_blocked_for_non_driver(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Jl. Merdeka',
            ])
            ->assertStatus(302);

        $this->assertDatabaseCount('towings', 0);
    }

    /** [HAPPY PATH] isproses default false saat towing baru dibuat. */
    public function test_store_sets_isproses_false_by_default(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.store'), [
                'lokasi' => 'Jl. Ahmad Yani',
            ]);

        $towing = Towing::where('driver_id', $driver->id)->first();
        $this->assertFalse((bool) $towing->isproses);
    }

    // =========================================================================
    // cancel (driver.towing.cancel)
    // =========================================================================

    /** [HAPPY PATH] Driver berhasil membatalkan towing miliknya yang berstatus Pending. */
    public function test_cancel_deletes_pending_towing(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Pending', 'isproses' => false]);

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('towings', ['id' => $towing->id]);
    }

    /** [HAPPY PATH] Driver berhasil membatalkan towing dengan status Diproses selama isproses = false. */
    public function test_cancel_deletes_diproses_towing_when_isproses_false(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Diproses', 'isproses' => false]);

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('towings', ['id' => $towing->id]);
    }

    /** [EDGE CASE] Tidak bisa membatalkan towing jika isproses = true. */
    public function test_cancel_fails_when_isproses_is_true(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Pending', 'isproses' => true]);

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    /** [EDGE CASE] Tidak bisa membatalkan towing dengan status Selesai. */
    public function test_cancel_fails_when_status_is_selesai(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Selesai', 'isproses' => false]);

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    /** [EDGE CASE] Tidak bisa membatalkan towing dengan status Dibatalkan. */
    public function test_cancel_fails_when_status_is_dibatalkan(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Dibatalkan', 'isproses' => false]);

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    /** [UNAUTHORIZED] Driver lain tidak bisa membatalkan towing milik driver lain. */
    public function test_cancel_fails_when_towing_belongs_to_another_driver(): void
    {
        $driver1 = $this->makeDriver();
        $driver2 = $this->makeDriver();
        $towing  = $this->createTowing($driver1, ['status' => 'Pending', 'isproses' => false]);

        $this->actingAs($driver2)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    /** [VALIDATION] Gagal jika towing_id tidak dikirim. */
    public function test_cancel_fails_without_towing_id(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [])
            ->assertSessionHasErrors('towing_id');
    }

    /** [VALIDATION] Gagal jika towing_id tidak ada di database. */
    public function test_cancel_fails_with_nonexistent_towing_id(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => 99999,
            ])
            ->assertSessionHasErrors('towing_id');
    }

    /** [UNAUTHORIZED] Guest tidak bisa membatalkan towing. */
    public function test_cancel_requires_auth(): void
    {
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver);

        $this->post(route('driver.towing.cancel'), [
            'towing_id' => $towing->id,
        ])->assertStatus(302);

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa membatalkan towing. */
    public function test_cancel_blocked_for_non_driver(): void
    {
        $admin  = $this->makeAdmin();
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver);

        $this->actingAs($admin)
            ->post(route('driver.towing.cancel'), [
                'towing_id' => $towing->id,
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('towings', ['id' => $towing->id]);
    }

    // =========================================================================
    // admin (admin.pengajuan-towing, admin.towing.update-status)
    // =========================================================================

    public function test_admin_pengajuan_towing_renders_with_pagination(): void
    {
        $admin  = $this->makeAdmin();
        $driver = $this->makeDriver();
        $this->createTowing($driver, ['lokasi' => 'Jl. Alfa Bandung']);

        $this->actingAs($admin)
            ->get(route('admin.pengajuan-towing'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Driver/TowingAdmin')
                ->has('towings.data', 1)
                ->has('towings.data.0', fn ($tow) => $tow
                    ->where('driver_id', $driver->id)
                    ->etc()
                )
                ->has('filters')
            );
    }

    public function test_admin_pengajuan_towing_search_filters_by_lokasi(): void
    {
        $admin   = $this->makeAdmin();
        $driver  = $this->makeDriver();
        $shown   = $this->createTowing($driver, ['lokasi' => 'Jl. XYZ Khusus Pencarian']);
        $driver2 = $this->makeDriver();
        $hidden  = $this->createTowing($driver2, ['lokasi' => 'Jl. ZZZ Lain']);

        $this->actingAs($admin)
            ->get(route('admin.pengajuan-towing', ['search' => 'Khusus Pencarian']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('towings.total', 1)
                ->where('towings.data.0.id', $shown->id)
            );

        $this->assertNotEquals($shown->id, $hidden->id);
    }

    public function test_admin_update_status_pending_to_diproses(): void
    {
        $admin  = $this->makeAdmin();
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Pending', 'isproses' => false]);

        $this->actingAs($admin)
            ->post(route('admin.towing.update-status'), [
                'towing_id' => $towing->id,
                'action'    => 'process',
            ])
            ->assertSessionHas('success');

        $towing->refresh();
        $this->assertSame('Diproses', $towing->status);
        $this->assertTrue($towing->isproses);
    }

    public function test_admin_process_towing_sets_kendaraan_pengajuan_dan_kerusakan_dari_towing(): void
    {
        $admin     = $this->makeAdmin();
        $driver    = $this->makeDriver();
        $kendaraan = $this->createKendaraan($driver, ['status' => 'Normal']);
        $towing    = $this->createTowing($driver, [
            'status'     => 'Pending',
            'isproses'   => false,
            'keterangan' => 'Mobil mogok di tol',
            'lokasi'     => 'KM 42 arah Bandung',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.towing.update-status'), [
                'towing_id' => $towing->id,
                'action'    => 'process',
            ])
            ->assertSessionHas('success');

        $kendaraan->refresh();
        $this->assertSame('Pengajuan Perbaikan', $kendaraan->status);

        $kerusakan = Kerusakan::where('kendaraan_id', $kendaraan->id)->latest()->first();
        $this->assertNotNull($kerusakan);
        $this->assertStringContainsString('Mobil mogok di tol', (string) $kerusakan->catatan);
        $this->assertStringContainsString('KM 42', (string) $kerusakan->catatan);
        $this->assertIsArray($kerusakan->kendala);
        $this->assertSame('Pengajuan Towing', $kerusakan->kendala[0]['name']);
        $this->assertStringContainsString('KM 42 arah Bandung', (string) $kerusakan->kendala[0]['description']);
    }

    public function test_admin_process_towing_appends_kerusakan_jika_kendaraan_sudah_pengajuan(): void
    {
        $admin     = $this->makeAdmin();
        $driver    = $this->makeDriver();
        $kendaraan = $this->createKendaraan($driver, ['status' => 'Pengajuan Perbaikan']);
        Kerusakan::create([
            'kendaraan_id' => $kendaraan->id,
            'catatan'      => 'Ada suara keras',
            'kendala'      => [['name' => 'Rem', 'description' => 'Bunyi']],
        ]);

        $towing = $this->createTowing($driver, [
            'status'     => 'Pending',
            'keterangan' => 'Butuh derek',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.towing.update-status'), [
                'towing_id' => $towing->id,
                'action'    => 'process',
            ]);

        $kendaraan->refresh();
        $this->assertSame('Pengajuan Perbaikan', $kendaraan->status);
        $this->assertSame(1, Kerusakan::where('kendaraan_id', $kendaraan->id)->count());

        $latest = Kerusakan::where('kendaraan_id', $kendaraan->id)->latest()->first();
        $this->assertCount(2, $latest->kendala ?? []);
        $this->assertStringContainsString('Butuh derek', (string) $latest->catatan);
    }

    public function test_admin_process_towing_tidak_ubah_kendaraan_saat_status_perbaikan(): void
    {
        $admin     = $this->makeAdmin();
        $driver    = $this->makeDriver();
        $kendaraan = $this->createKendaraan($driver, ['status' => 'Perbaikan']);
        $towing    = $this->createTowing($driver, ['status' => 'Pending', 'isproses' => false]);

        $this->actingAs($admin)
            ->post(route('admin.towing.update-status'), [
                'towing_id' => $towing->id,
                'action'    => 'process',
            ]);

        $kendaraan->refresh();
        $this->assertSame('Perbaikan', $kendaraan->status);
        $this->assertSame(0, Kerusakan::where('kendaraan_id', $kendaraan->id)->count());
    }

    public function test_admin_update_status_diproses_to_selesai(): void
    {
        $admin  = $this->makeAdmin();
        $driver = $this->makeDriver();
        $towing = $this->createTowing($driver, ['status' => 'Diproses', 'isproses' => true]);

        $this->actingAs($admin)
            ->post(route('admin.towing.update-status'), [
                'towing_id' => $towing->id,
                'action'    => 'complete',
            ])
            ->assertSessionHas('success');

        $towing->refresh();
        $this->assertSame('Selesai', $towing->status);
    }

    public function test_admin_pengajuan_towing_blocked_for_guest(): void
    {
        $this->get(route('admin.pengajuan-towing'))->assertRedirect();
    }
}
