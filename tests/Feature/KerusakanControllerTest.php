<?php

namespace Tests\Feature;

use App\Models\Kendaraan;
use App\Models\Kerusakan;
use App\Models\Keruskaanacc;
use App\Models\User;
use App\Models\Bill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for KerusakanController.
 * Methods: store, storeFromChat, cancel, update, approve,
 *          index, mekanikDashboard, mekanikDetail, markAsPending
 */
class KerusakanControllerTest extends TestCase
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

    private function makeKendaraan(array $e = []): Kendaraan
    {
        return Kendaraan::create(array_merge([
            'merek'      => 'Toyota',
            'plat_nomor' => 'B' . rand(1000, 9999) . 'XX',
            'status'     => 'Normal',
        ], $e));
    }

    private function makeKerusakan(array $e = []): Kerusakan
    {
        return Kerusakan::create(array_merge([
            'kendaraan_id' => $this->makeKendaraan()->id,
            'catatan'      => 'test catatan',
            'kendala'      => [['name' => 'Rem', 'description' => 'Rem blong']],
        ], $e));
    }

    // =========================================================================
    // store (driver.report.store)
    // =========================================================================

    /** [HAPPY PATH] Driver reports a kerusakan on their own kendaraan. */
    public function test_store_creates_kerusakan_and_changes_status(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Normal']);

        $this->actingAs($driver)->post(route('driver.report.store'), [
            'kendaraan_id' => $kendaraan->id,
            'catatan'      => 'Bunyi aneh',
            'kendala'      => [['name' => 'Mesin', 'description' => 'Bunyi ketok']],
        ])->assertRedirect(route('driver.dashboard'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('kerusakans', ['kendaraan_id' => $kendaraan->id]);
        $this->assertEquals('Pengajuan Perbaikan', $kendaraan->fresh()->status);
    }

    /** [VALIDATION] Missing kendaraan_id. */
    public function test_store_fails_without_kendaraan_id(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->post(route('driver.report.store'), [
            'catatan' => 'x',
        ])->assertSessionHasErrors('kendaraan_id');
    }

    /** [VALIDATION] Non-existent kendaraan_id. */
    public function test_store_fails_with_nonexistent_kendaraan(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->post(route('driver.report.store'), [
            'kendaraan_id' => 99999,
        ])->assertSessionHasErrors('kendaraan_id');
    }

    /** [UNAUTHORIZED] Driver cannot report for another driver's kendaraan. */
    public function test_store_fails_when_kendaraan_belongs_to_another_driver(): void
    {
        $driver1   = $this->makeDriver();
        $driver2   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver2->id]);

        $this->actingAs($driver1)->post(route('driver.report.store'), [
            'kendaraan_id' => $kendaraan->id,
        ])->assertSessionHasErrors('kendaraan_id');
    }

    /** [UNAUTHORIZED] Guest cannot submit report. */
    public function test_store_requires_auth(): void
    {
        $this->post(route('driver.report.store'), ['kendaraan_id' => 1])
            ->assertStatus(302);
        $this->assertGuest();
    }

    // =========================================================================
    // storeFromChat (driver.kerusakan.store-from-chat)
    // =========================================================================

    /** [HAPPY PATH] Driver reports kerusakan from chat. */
    public function test_store_from_chat_creates_kerusakan(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Normal']);

        $this->actingAs($driver)->post(route('driver.kerusakan.store-from-chat'), [
            'kendaraan_id' => $kendaraan->id,
            'catatan'      => 'AI catatan',
            'kendala'      => [['name' => 'Ban', 'description' => 'Bocor']],
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('kerusakans', ['kendaraan_id' => $kendaraan->id]);
        $this->assertEquals('Pengajuan Perbaikan', $kendaraan->fresh()->status);
    }

    /** [VALIDATION] kendala is required and must have min 1 item. */
    public function test_store_from_chat_fails_without_kendala(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id]);

        $this->actingAs($driver)->post(route('driver.kerusakan.store-from-chat'), [
            'kendaraan_id' => $kendaraan->id,
            'kendala'      => [],
        ])->assertSessionHasErrors('kendala');
    }

    /** [EDGE CASE] Kendaraan already in repair process – rejected. */
    public function test_store_from_chat_fails_when_kendaraan_already_in_repair(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Perbaikan']);

        $this->actingAs($driver)->post(route('driver.kerusakan.store-from-chat'), [
            'kendaraan_id' => $kendaraan->id,
            'kendala'      => [['name' => 'X', 'description' => 'Y']],
        ])->assertSessionHasErrors('kendala');
    }

    // =========================================================================
    // cancel (driver.kerusakan.cancel)
    // =========================================================================

    /** [HAPPY PATH] Driver can cancel pengajuan while status is 'Pengajuan Perbaikan'. */
    public function test_cancel_resets_status_to_normal(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Pengajuan Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        $this->actingAs($driver)->post(route('driver.kerusakan.cancel'), [
            'kendaraan_id' => $kendaraan->id,
        ])->assertRedirect(route('driver.dashboard'))
            ->assertSessionHas('success');

        $this->assertEquals('Normal', $kendaraan->fresh()->status);
        $this->assertDatabaseMissing('kerusakans', ['id' => $kerusakan->id]);
    }

    /** [EDGE CASE] Cannot cancel when status is not 'Pengajuan Perbaikan'. */
    public function test_cancel_fails_when_status_not_pengajuan(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Perbaikan']);

        $this->actingAs($driver)->post(route('driver.kerusakan.cancel'), [
            'kendaraan_id' => $kendaraan->id,
        ])->assertSessionHas('error');
    }

    /** [UNAUTHORIZED] Cancel another driver's kendaraan is blocked. */
    public function test_cancel_fails_for_wrong_driver(): void
    {
        $driver1   = $this->makeDriver();
        $driver2   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver2->id, 'status' => 'Pengajuan Perbaikan']);

        $this->actingAs($driver1)->post(route('driver.kerusakan.cancel'), [
            'kendaraan_id' => $kendaraan->id,
        ])->assertSessionHasErrors('kendaraan_id');
    }

    // =========================================================================
    // update (driver.kerusakan.update)
    // =========================================================================

    /** [HAPPY PATH] Driver can update their kerusakan. */
    public function test_update_modifies_kerusakan(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Pengajuan Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        $this->actingAs($driver)->put(route('driver.kerusakan.update', $kerusakan->id), [
            'catatan' => 'Updated catatan',
            'kendala' => [['name' => 'Updated', 'description' => 'Desc']],
        ])->assertRedirect(route('driver.dashboard'))
            ->assertSessionHas('success');

        $this->assertEquals('Updated catatan', $kerusakan->fresh()->catatan);
    }

    /** [EDGE CASE] Cannot update when status is 'Perbaikan'. */
    public function test_update_fails_when_kendaraan_in_repair(): void
    {
        $driver   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver->id, 'status' => 'Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        $this->actingAs($driver)->put(route('driver.kerusakan.update', $kerusakan->id), [
            'catatan' => 'try update',
        ])->assertSessionHas('error');
    }

    /** [UNAUTHORIZED] Another driver cannot update kerusakan. */
    public function test_update_fails_for_wrong_driver(): void
    {
        $driver1   = $this->makeDriver();
        $driver2   = $this->makeDriver();
        $kendaraan = $this->makeKendaraan(['driver_id' => $driver2->id]);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        $this->actingAs($driver1)->put(route('driver.kerusakan.update', $kerusakan->id), [
            'catatan' => 'hack',
        ])->assertSessionHasErrors('kendaraan_id');
    }

    // =========================================================================
    // approve (admin.kerusakan.approve)
    // =========================================================================

    /** [HAPPY PATH] Admin can approve a kerusakan and assign mekanik. */
    public function test_approve_creates_keruskaanacc_and_sets_perbaikan_status(): void
    {
        $admin    = $this->makeAdmin();
        $mekanik  = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan(['status' => 'Pengajuan Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        $this->actingAs($admin)->post(route('admin.kerusakan.approve'), [
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
        ])->assertRedirect(route('admin.pengajuan-perbaikan'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('keruskaanaccs', [
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
        ]);
        $this->assertEquals('Perbaikan', $kendaraan->fresh()->status);
         dump('Pengajuan perbaikan berhasil disetujui dan ditugaskan ke mekanik!');
    }

    /** [VALIDATION] Missing kerusakan_id. */
    public function test_approve_fails_without_kerusakan_id(): void
    {
        $admin   = $this->makeAdmin();
        $mekanik = $this->makeMekanik();
        $this->actingAs($admin)->post(route('admin.kerusakan.approve'), [
            'mekanik_id' => $mekanik->id,
        ])->assertSessionHasErrors('kerusakan_id');
    }

    /** [VALIDATION] Missing mekanik_id. */
    public function test_approve_fails_without_mekanik_id(): void
    {
        $admin    = $this->makeAdmin();
        $kerusakan = $this->makeKerusakan();
        $this->actingAs($admin)->post(route('admin.kerusakan.approve'), [
            'kerusakan_id' => $kerusakan->id,
        ])->assertSessionHasErrors('mekanik_id');
         dump('Mekanik tidak di temukan.');
    }

    /** [EDGE CASE] Approving already-approved kerusakan returns error. */
    public function test_approve_fails_when_already_approved(): void
    {
        $admin    = $this->makeAdmin();
        $mekanik  = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan();
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);

        // First approval
        Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        // Second approval attempt
        $this->actingAs($admin)->post(route('admin.kerusakan.approve'), [
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
        ])->assertRedirect(route('admin.pengajuan-perbaikan'))
            ->assertSessionHas('error');
        dump('Kerusakan ini sudah ditugaskan ke mekanik sebelumnya.');
    }

    /** [EDGE CASE] Mekanik_id belongs to non-Mekanik user. */
    public function test_approve_fails_when_user_is_not_mekanik(): void
    {
        $admin    = $this->makeAdmin();
        $driver   = $this->makeDriver();
        $kerusakan = $this->makeKerusakan();
        $this->actingAs($admin)->post(route('admin.kerusakan.approve'), [
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $driver->id,
        ])->assertRedirect(route('admin.pengajuan-perbaikan'))
            ->assertSessionHas('error');
    }

    // =========================================================================
    // index (admin.pengajuan-perbaikan)
    // =========================================================================

    /** [HAPPY PATH] Admin sees pengajuan perbaikan list. */
    public function test_index_renders_pengajuan_for_admin(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('admin.pengajuan-perbaikan'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/PengajuanPerbaikan')
                ->has('kerusakans')->has('mekaniks')->has('perbaikans'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('admin.pengajuan-perbaikan'))->assertStatus(302);
    }

    // =========================================================================
    // mekanikDashboard (mekanik.dashboard)
    // =========================================================================

    /** [HAPPY PATH] Mekanik sees their dashboard. */
    public function test_mekanik_dashboard_renders(): void
    {
        $mekanik = $this->makeMekanik();
        $this->actingAs($mekanik)->get(route('mekanik.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Mekanik/DashboardMekanik'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_mekanik_dashboard_requires_auth(): void
    {
        $this->get(route('mekanik.dashboard'))->assertStatus(302);
    }

    /** [UNAUTHORIZED] Driver blocked by middleware. */
    public function test_mekanik_dashboard_blocked_for_driver(): void
    {
        $driver = $this->makeDriver();
        $this->actingAs($driver)->get(route('mekanik.dashboard'))->assertStatus(302);
    }

    // =========================================================================
    // mekanikDetail (mekanik.detailkerusakan)
    // =========================================================================

    /** [HAPPY PATH] Mekanik sees detail for their assignment. */
    public function test_mekanik_detail_renders_for_assigned_mekanik(): void
    {
        $mekanik   = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan(['status' => 'Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        $this->actingAs($mekanik)->get(route('mekanik.detailkerusakan', $acc->id))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Mekanik/DetailKerusakan'));
    }

    /** [UNAUTHORIZED] Mekanik cannot see another mekanik's assignment. */
    public function test_mekanik_detail_returns_404_for_wrong_mekanik(): void
    {
        $mekanik1  = $this->makeMekanik();
        $mekanik2  = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan();
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik2->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        $this->actingAs($mekanik1)->get(route('mekanik.detailkerusakan', $acc->id))
            ->assertStatus(404);
    }

    /** [EDGE CASE] Mekanik is redirected if bill already exists. */
    public function test_mekanik_detail_redirects_when_bill_exists(): void
    {
        $mekanik   = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan(['status' => 'Normal']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);
        Bill::create([
            'keruskaanacc_id' => $acc->id,
            'detail_biaya'    => [['text' => 'Part', 'nominal' => 50000]],
            'total_biaya'     => 50000,
        ]);

        $this->actingAs($mekanik)->get(route('mekanik.detailkerusakan', $acc->id))
            ->assertRedirect(route('mekanik.dashboard'))
            ->assertSessionHas('error');
    }

    // =========================================================================
    // markAsPending (mekanik.mark-as-pending)
    // =========================================================================

    /** [HAPPY PATH] Mekanik can mark kendaraan as pending. */
    public function test_mark_as_pending_sets_status(): void
    {
        $mekanik   = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan(['status' => 'Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        $this->actingAs($mekanik)->post(route('mekanik.mark-as-pending'), [
            'keruskaanacc_id' => $acc->id,
        ])->assertRedirect(route('mekanik.dashboard'))
            ->assertSessionHas('success');

        $this->assertEquals('Pending', $kendaraan->fresh()->status);
    }

    /** [UNAUTHORIZED] Another mekanik cannot mark someone else's assignment as pending. */
    public function test_mark_as_pending_fails_for_wrong_mekanik(): void
    {
        $mekanik1  = $this->makeMekanik();
        $mekanik2  = $this->makeMekanik();
        $kendaraan = $this->makeKendaraan(['status' => 'Perbaikan']);
        $kerusakan = $this->makeKerusakan(['kendaraan_id' => $kendaraan->id]);
        $acc = Keruskaanacc::create([
            'kerusakan_id' => $kerusakan->id,
            'mekanik_id'   => $mekanik2->id,
            'kendaraan_id' => $kendaraan->id,
        ]);

        $this->actingAs($mekanik1)->post(route('mekanik.mark-as-pending'), [
            'keruskaanacc_id' => $acc->id,
        ])->assertSessionHas('error');
    }

    /** [VALIDATION] Missing keruskaanacc_id. */
    public function test_mark_as_pending_fails_without_keruskaanacc_id(): void
    {
        $mekanik = $this->makeMekanik();
        $this->actingAs($mekanik)->post(route('mekanik.mark-as-pending'), [])
            ->assertSessionHasErrors('keruskaanacc_id');
    }

    /** [UNAUTHORIZED] Guest cannot mark as pending. */
    public function test_mark_as_pending_requires_auth(): void
    {
        $this->post(route('mekanik.mark-as-pending'), ['keruskaanacc_id' => 1])
            ->assertStatus(302);
        $this->assertGuest();
    }
}