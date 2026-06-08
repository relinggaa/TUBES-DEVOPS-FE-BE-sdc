<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Kendaraan;
use App\Models\Kerusakan;
use App\Models\Keruskaanacc;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for BillController.
 * Methods: store, index
 */
class BillControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

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

    /**
     * Create a full repair chain: driver → kendaraan → kerusakan → keruskaanacc (assigned to $mekanik).
     */
    private function createAccAssignment(User $mekanik, array $kendaraanExtra = []): array
    {
        $driver    = $this->makeDriver();
        $kendaraan = Kendaraan::create(array_merge([
            'merek'      => 'Toyota',
            'plat_nomor' => 'B' . rand(1000, 9999) . 'YY',
            'driver_id'  => $driver->id,
            'status'     => 'Perbaikan',
        ], $kendaraanExtra));
        $kerusakan = Kerusakan::create([
            'kendaraan_id' => $kendaraan->id,
            'catatan'      => 'test',
            'kendala'      => [['name' => 'Ban', 'description' => 'Bocor']],
        ]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);
        return compact('driver', 'kendaraan', 'kerusakan', 'acc');
    }

    // =========================================================================
    // store (mekanik.bill.store)
    // =========================================================================

    /** [HAPPY PATH] Mekanik stores a valid bill. */
    public function test_store_creates_bill_and_sets_kendaraan_normal(): void
    {
        Storage::fake('public');
        $mekanik = $this->makeMekanik();
        ['acc' => $acc, 'kendaraan' => $kendaraan] = $this->createAccAssignment($mekanik);

        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [
                ['text' => 'Jasa Servis', 'nominal' => 150000, 'sparepart' => null],
                ['text' => 'Oli',         'nominal' => 50000,  'sparepart' => 'Oli 10W40'],
            ],
        ])->assertRedirect(route('mekanik.dashboard'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('bills', [
            'keruskaanacc_id' => $acc->id,
            'total_biaya'     => 200000,
        ]);
        $this->assertEquals('Normal', $kendaraan->fresh()->status);
    }

    /** [HAPPY PATH] Bill can be stored with bukti_bill image. */
    public function test_store_creates_bill_with_bukti_bill(): void
    {
        Storage::fake('public');
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);

        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa', 'nominal' => 100000]],
            'bukti_bill'      => UploadedFile::fake()->image('receipt.jpg'),
        ])->assertRedirect(route('mekanik.dashboard'));

        $bill = Bill::where('keruskaanacc_id', $acc->id)->first();
        $this->assertNotNull($bill->bukti_bill);
        Storage::disk('public')->assertExists($bill->bukti_bill);
    }

    /** [VALIDATION] Missing keruskaanacc_id. */
    public function test_store_fails_without_keruskaanacc_id(): void
    {
        $mekanik = $this->makeMekanik();
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'detail_biaya' => [['text' => 'x', 'nominal' => 10000]],
        ])->assertSessionHasErrors('keruskaanacc_id');
    }

    /** [VALIDATION] Non-existent keruskaanacc_id. */
    public function test_store_fails_with_nonexistent_keruskaanacc(): void
    {
        $mekanik = $this->makeMekanik();
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => 99999,
            'detail_biaya'    => [['text' => 'x', 'nominal' => 10000]],
        ])->assertSessionHasErrors('keruskaanacc_id');
    }

    /** [VALIDATION] detail_biaya is required. */
    public function test_store_fails_without_detail_biaya(): void
    {
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
        ])->assertSessionHasErrors('detail_biaya');
    }

    /** [VALIDATION] detail_biaya item missing 'text'. */
    public function test_store_fails_when_detail_biaya_item_missing_text(): void
    {
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => '', 'nominal' => 10000]],
        ])->assertSessionHasErrors('detail_biaya.0.text');
    }

    /** [VALIDATION] detail_biaya item missing 'nominal'. */
    public function test_store_fails_when_detail_biaya_item_missing_nominal(): void
    {
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa', 'nominal' => 'not-a-number']],
        ])->assertSessionHasErrors('detail_biaya.0.nominal');
    }

    /** [VALIDATION] Non-image bukti_bill rejected. */
    public function test_store_fails_with_non_image_bukti_bill(): void
    {
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa', 'nominal' => 10000]],
            'bukti_bill'      => UploadedFile::fake()->create('receipt.pdf', 10, 'application/pdf'),
        ])->assertSessionHasErrors('bukti_bill');
    }

    /** [UNAUTHORIZED] Another mekanik cannot create bill for someone else's assignment. */
    public function test_store_fails_when_mekanik_is_not_the_assigned_one(): void
    {
        Storage::fake('public');
        $mekanik1  = $this->makeMekanik();
        $mekanik2  = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik1);

        $this->actingAs($mekanik2)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa', 'nominal' => 10000]],
        ])->assertSessionHas('error');
    }

    /** [EDGE CASE] Cannot create a second bill for the same assignment. */
    public function test_store_fails_when_bill_already_exists(): void
    {
        Storage::fake('public');
        $mekanik = $this->makeMekanik();
        ['acc' => $acc] = $this->createAccAssignment($mekanik);

        // First bill
        Bill::create([
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa', 'nominal' => 10000]],
            'total_biaya'     => 10000,
        ]);

        // Second bill attempt
        $this->actingAs($mekanik)->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Jasa Lagi', 'nominal' => 20000]],
        ])->assertSessionHas('error');
    }

    /** [UNAUTHORIZED] Guest cannot store bill. */
    public function test_store_requires_auth(): void
    {
        $this->post(route('mekanik.bill.store'), [
            'keruskaanacc_id' => 1,
            'detail_biaya'    => [['text' => 'x', 'nominal' => 1000]],
        ])->assertStatus(302);
        $this->assertGuest();
    }

    // =========================================================================
    // index (admin.laporan-biaya)
    // =========================================================================

    /** [HAPPY PATH] Admin sees bill list. */
    public function test_index_renders_for_admin(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('admin.laporan-biaya'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/LaporanBiaya')
                ->has('bills')->has('filters'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('admin.laporan-biaya'))->assertStatus(302);
    }

    /** [UNAUTHORIZED] Driver cannot access laporan biaya. */
    public function test_index_blocked_for_driver(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('admin.laporan-biaya'))->assertStatus(302);
    }

    /** [HAPPY PATH] Search parameter is accepted. */
    public function test_index_accepts_search_param(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('admin.laporan-biaya', ['search' => 'Toyota']))
            ->assertStatus(200);
    }

    /** [EDGE CASE] Empty result set when no bills exist. */
    public function test_index_returns_empty_bills_when_none_exist(): void
    {
        $admin = $this->makeAdmin();
        $response = $this->actingAs($admin)->get(route('admin.laporan-biaya'));
        $response->assertInertia(fn ($p) => $p->where('bills.total', 0));
    }
}
