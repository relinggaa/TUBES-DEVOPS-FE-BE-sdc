<?php

namespace Tests\Feature;

use App\Models\Kendaraan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for KendaraanController.
 * Methods: index, store, update, destroy, driverDashboard,
 *          driverReport, driverTanyaAI, mekanikTanyaAI
 */
class KendaraanControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(array $e = []): User
    {
        return User::create(array_merge(['username' => 'adm_' . uniqid(), 'role' => 'Admin',
            'key' => strtoupper(bin2hex(random_bytes(4)))], $e));
    }

    private function makeDriver(array $e = []): User
    {
        return User::create(array_merge(['username' => 'drv_' . uniqid(), 'role' => 'Driver',
            'key' => strtoupper(bin2hex(random_bytes(4)))], $e));
    }

    private function makeMekanik(array $e = []): User
    {
        return User::create(array_merge(['username' => 'mek_' . uniqid(), 'role' => 'Mekanik',
            'key' => strtoupper(bin2hex(random_bytes(4)))], $e));
    }

    private function makeKendaraan(array $e = []): Kendaraan
    {
        return Kendaraan::create(array_merge([
            'merek'      => 'Toyota',
            'plat_nomor' => 'B' . rand(1000, 9999) . 'XX',
            'status'     => 'Normal',
        ], $e));
    }

    // =========================================================================
    // index (Admin/Kendaraan)
    // =========================================================================

    /** [HAPPY PATH] Admin can view kendaraan list. */
    public function test_index_renders_for_admin(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('kendaraan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/Kendaraan')
                ->has('kendaraans')->has('drivers')->has('filters'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('kendaraan.index'))->assertStatus(302);
    }

    /** [UNAUTHORIZED] Driver cannot access kendaraan admin index. */
    public function test_index_blocked_for_driver(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('kendaraan.index'))->assertStatus(302);
    }

    /** [HAPPY PATH] Search filter is accepted. */
    public function test_index_accepts_search_param(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('kendaraan.index', ['search' => 'Toyota']))
            ->assertStatus(200);
    }

    // =========================================================================
    // store
    // =========================================================================

    /** [HAPPY PATH] Admin can add a kendaraan without gambar. */
    public function test_store_creates_kendaraan(): void
    {
        Storage::fake('public');
        $admin  = $this->makeAdmin();
        $driver = $this->makeDriver();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'     => 'Honda',
            'plat_nomor' => 'D1234XY',
            'driver_id'  => $driver->id,
        ])->assertRedirect(route('kendaraan.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseHas('kendaraans', ['plat_nomor' => 'D1234XY']);
    }

    /** [HAPPY PATH] Admin can add a kendaraan with gambar. */
    public function test_store_creates_kendaraan_with_image(): void
    {
        Storage::fake('public');
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => 'Suzuki',
            'plat_nomor' => 'E9999ZZ',
            'gambar'     => UploadedFile::fake()->image('car.jpg'),
        ])->assertRedirect(route('kendaraan.index'));
        $kendaraan = Kendaraan::where('plat_nomor', 'E9999ZZ')->first();
        $this->assertNotNull($kendaraan->gambar);
        Storage::disk('public')->assertExists($kendaraan->gambar);
    }

    /** [VALIDATION] Missing merek. */
    public function test_store_fails_without_merek(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => '',
            'plat_nomor' => 'F1111AB',
        ])->assertSessionHasErrors('merek');
    }

    /** [VALIDATION] Missing plat_nomor. */
    public function test_store_fails_without_plat_nomor(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => 'Honda',
            'plat_nomor' => '',
        ])->assertSessionHasErrors('plat_nomor');
    }

    /** [VALIDATION] Duplicate plat_nomor is rejected. */
    public function test_store_fails_with_duplicate_plat_nomor(): void
    {
        $admin = $this->makeAdmin();
        $this->makeKendaraan(['plat_nomor' => 'G7777CD']);
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => 'Yamaha',
            'plat_nomor' => 'G7777CD',
        ])->assertSessionHasErrors('plat_nomor');
    }

    /** [VALIDATION] Invalid driver_id (non-existent user). */
    public function test_store_fails_with_invalid_driver_id(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => 'Mazda',
            'plat_nomor' => 'H5555EF',
            'driver_id'  => 99999,
        ])->assertSessionHasErrors('driver_id');
    }

    /** [VALIDATION] Non-image gambar rejected. */
    public function test_store_fails_with_non_image_gambar(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('kendaraan.store'), [
            'merek'      => 'Mazda',
            'plat_nomor' => 'I3333GH',
            'gambar'     => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ])->assertSessionHasErrors('gambar');
    }

    // =========================================================================
    // update
    // =========================================================================

    /** [HAPPY PATH] Admin can update a kendaraan. */
    public function test_update_modifies_kendaraan(): void
    {
        Storage::fake('public');
        $admin    = $this->makeAdmin();
        $kendaraan = $this->makeKendaraan(['plat_nomor' => 'OLD001A']);
        $this->actingAs($admin)
            ->post(route('kendaraan.update', $kendaraan->id), [
                '_method'    => 'PUT',
                'merek'      => 'NewMerek',
                'plat_nomor' => 'NEW001B',
            ])->assertRedirect(route('kendaraan.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseHas('kendaraans', ['id' => $kendaraan->id, 'merek' => 'NewMerek']);
    }

    /** [VALIDATION] Duplicate plat_nomor rejected on update. */
    public function test_update_fails_with_duplicate_plat_nomor(): void
    {
        $admin = $this->makeAdmin();
        $this->makeKendaraan(['plat_nomor' => 'DUP001A']);
        $kendaraan = $this->makeKendaraan(['plat_nomor' => 'UPD001B']);
        $this->actingAs($admin)
            ->post(route('kendaraan.update', $kendaraan->id), [
                '_method'    => 'PUT',
                'merek'      => 'Honda',
                'plat_nomor' => 'DUP001A',
            ])->assertSessionHasErrors('plat_nomor');
    }

    /** [EDGE CASE] 404 when kendaraan not found. */
    public function test_update_returns_404_for_nonexistent(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)
            ->post(route('kendaraan.update', 99999), [
                '_method'    => 'PUT',
                'merek'      => 'x',
                'plat_nomor' => 'NOTFOUND',
            ])->assertStatus(404);
    }

    // =========================================================================
    // destroy
    // =========================================================================

    /** [HAPPY PATH] Admin can delete a kendaraan. */
    public function test_destroy_deletes_kendaraan(): void
    {
        Storage::fake('public');
        $admin    = $this->makeAdmin();
        $kendaraan = $this->makeKendaraan();
        $this->actingAs($admin)->delete(route('kendaraan.destroy', $kendaraan->id))
            ->assertRedirect(route('kendaraan.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseMissing('kendaraans', ['id' => $kendaraan->id]);
    }

    /** [EDGE CASE] Gambar file deleted on destroy. */
    public function test_destroy_deletes_associated_gambar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('kendaraan/car.jpg', 'data');
        $admin    = $this->makeAdmin();
        $kendaraan = $this->makeKendaraan(['gambar' => 'kendaraan/car.jpg']);
        $this->actingAs($admin)->delete(route('kendaraan.destroy', $kendaraan->id));
        Storage::disk('public')->assertMissing('kendaraan/car.jpg');
    }

    /** [EDGE CASE] 404 when kendaraan not found. */
    public function test_destroy_returns_404_for_nonexistent(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->delete(route('kendaraan.destroy', 99999))
            ->assertStatus(404);
    }

    // =========================================================================
    // driverDashboard
    // =========================================================================

    /** [HAPPY PATH] Driver sees their dashboard. */
    public function test_driver_dashboard_renders(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('driver.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Driver/DashboardDriver'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_driver_dashboard_requires_auth(): void
    {
        $this->get(route('driver.dashboard'))->assertStatus(302);
    }

    /** [HAPPY PATH] Driver with kendaraan sees kendaraan data. */
    public function test_driver_dashboard_returns_kendaraan_data(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id]);
        $response = $this->actingAs($driver)->get(route('driver.dashboard'));
        $response->assertInertia(fn ($p) => $p->where('kendaraan.id', $kendaraan->id));
    }

    /** [EDGE CASE] Driver without kendaraan sees null. */
    public function test_driver_dashboard_kendaraan_null_when_no_vehicle(): void
    {
        $driver = $this->makeDriver();
        $response = $this->actingAs($driver)->get(route('driver.dashboard'));
        $response->assertInertia(fn ($p) => $p->where('kendaraan', null));
    }

    // =========================================================================
    // driverReport
    // =========================================================================

    /** [HAPPY PATH] Driver sees report page. */
    public function test_driver_report_renders(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('driver.report'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Driver/ReportDriver'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_driver_report_requires_auth(): void
    {
        $this->get(route('driver.report'))->assertStatus(302);
    }

    // =========================================================================
    // driverTanyaAI
    // =========================================================================

    /** [HAPPY PATH] Driver sees TanyaAI page. */
    public function test_driver_tanya_ai_renders(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('driver.tanya-ai'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Driver/SagaraAI'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_driver_tanya_ai_requires_auth(): void
    {
        $this->get(route('driver.tanya-ai'))->assertStatus(302);
    }

    // =========================================================================
    // mekanikTanyaAI
    // =========================================================================

    /** [HAPPY PATH] Mekanik sees TanyaAI page. */
    public function test_mekanik_tanya_ai_renders(): void
    {
        $mekanik = $this->makeMekanik();
        $this->actingAs($mekanik)->get(route('mekanik.tanya-ai'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Mekanik/SagaraAI'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_mekanik_tanya_ai_requires_auth(): void
    {
        $this->get(route('mekanik.tanya-ai'))->assertStatus(302);
    }

    /** [UNAUTHORIZED] Driver blocked by middleware. */
    public function test_mekanik_tanya_ai_blocked_for_driver(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('mekanik.tanya-ai'))->assertStatus(302);
    }
}
