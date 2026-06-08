<?php

namespace Tests\Feature;

use App\Models\StrukBensin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for BensinController.
 * Methods: index, store, cancel
 */
class BensinControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function makeDriver(array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'drv_' . uniqid(),
            'role' => 'Driver',
            'key' => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    private function makeAdmin(array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'adm_' . uniqid(),
            'role' => 'Admin',
            'key' => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    private function createStruk(User $driver, array $extra = []): StrukBensin
    {
        return StrukBensin::create(array_merge([
            'user_id' => $driver->id,
            'gambar' => 'struk_bensin/test.jpg',
            'bank' => 'BRI',
            'no_rekening' => '1234567890',
            'is_accept' => null,
        ], $extra));
    }

    // =========================================================================
    // index (driver.struk-bensin)
    // =========================================================================

    /** [HAPPY PATH] Driver dapat melihat halaman upload bill beserta riwayatnya. */
    public function test_index_renders_for_driver(): void
    {
        $driver = $this->makeDriver();
        $this->createStruk($driver);

        $this->actingAs($driver)
            ->get(route('driver.struk-bensin'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Driver/UploadBill')
                ->has('riwayatStruk')
                ->count('riwayatStruk', 1)
            );
    }

    /** [EDGE CASE] Driver hanya melihat riwayat miliknya sendiri. */
    public function test_index_only_shows_own_history(): void
    {
        $driver1 = $this->makeDriver();
        $driver2 = $this->makeDriver();
        $this->createStruk($driver1);
        $this->createStruk($driver2);

        $this->actingAs($driver1)
            ->get(route('driver.struk-bensin'))
            ->assertInertia(fn ($page) => $page->count('riwayatStruk', 1));
    }

    /** [UNAUTHORIZED] Guest tidak bisa mengakses halaman struk bensin driver. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('driver.struk-bensin'))->assertStatus(302);
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa akses halaman struk bensin driver. */
    public function test_index_blocked_for_non_driver(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->get(route('driver.struk-bensin'))
            ->assertStatus(302);
    }

    // =========================================================================
    // store (driver.struk-bensin.store)
    // =========================================================================

    /** [HAPPY PATH] Driver dapat upload gambar struk bensin. */
    public function test_store_uploads_struk_successfully(): void
    {
        Storage::fake('public');
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('struk.jpg'),
                'bank' => 'BCA',
                'no_rekening' => '7770011223344',
            ])
            ->assertSessionHas('success');

        $struk = StrukBensin::where('user_id', $driver->id)->first();

        $this->assertNotNull($struk);
        $this->assertSame('BCA', $struk->bank);
        $this->assertSame('7770011223344', $struk->no_rekening);
        $this->assertNull($struk->is_accept);
        Storage::disk('public')->assertExists($struk->gambar);
    }

    /** [VALIDATION] Gagal upload jika bank tidak dikirim. */
    public function test_store_fails_without_bank(): void
    {
        Storage::fake('public');
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('struk.jpg'),
                'no_rekening' => '123',
            ])
            ->assertSessionHasErrors('bank');
    }

    /** [VALIDATION] Gagal upload jika bank tidak termasuk daftar. */
    public function test_store_fails_with_invalid_bank(): void
    {
        Storage::fake('public');
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('struk.jpg'),
                'bank' => 'BANK XYZ',
                'no_rekening' => '123',
            ])
            ->assertSessionHasErrors('bank');
    }

    /** [VALIDATION] Gagal upload jika nomor rekening kosong. */
    public function test_store_fails_without_no_rekening(): void
    {
        Storage::fake('public');
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('struk.jpg'),
                'bank' => 'MANDIRI',
                'no_rekening' => '   ',
            ])
            ->assertSessionHasErrors('no_rekening');
    }

    /** [VALIDATION] Gagal upload jika gambar tidak dikirim. */
    public function test_store_fails_without_gambar(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] Gagal upload jika file bukan image. */
    public function test_store_fails_with_non_image_file(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->create('document.pdf', 20, 'application/pdf'),
            ])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] Gagal upload jika gambar lebih dari 2MB. */
    public function test_store_fails_with_oversized_image(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('large.jpg')->size(3000),
            ])
            ->assertSessionHasErrors('gambar');
    }

    /** [UNAUTHORIZED] Guest tidak bisa upload struk bensin. */
    public function test_store_requires_auth(): void
    {
        $this->post(route('driver.struk-bensin.store'), [
            'gambar' => UploadedFile::fake()->image('struk.jpg'),
        ])->assertStatus(302);

        $this->assertDatabaseCount('struk_bensins', 0);
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa upload struk bensin driver. */
    public function test_store_blocked_for_non_driver(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->post(route('driver.struk-bensin.store'), [
                'gambar' => UploadedFile::fake()->image('struk.jpg'),
                'bank' => 'BNI',
                'no_rekening' => '1',
            ])
            ->assertStatus(302);

        $this->assertDatabaseCount('struk_bensins', 0);
    }

    // =========================================================================
    // cancel (driver.struk-bensin.cancel)
    // =========================================================================

    /** [HAPPY PATH] Driver dapat membatalkan struk ketika is_accept masih null. */
    public function test_cancel_deletes_struk_when_is_accept_null(): void
    {
        $driver = $this->makeDriver();
        $struk = $this->createStruk($driver, ['is_accept' => null]);

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => $struk->id,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('struk_bensins', ['id' => $struk->id]);
    }

    /** [EDGE CASE] Tidak bisa cancel jika is_accept true (sudah diterima). */
    public function test_cancel_fails_when_is_accept_true(): void
    {
        $driver = $this->makeDriver();
        $struk = $this->createStruk($driver, ['is_accept' => true]);

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => $struk->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('struk_bensins', ['id' => $struk->id, 'is_accept' => true]);
    }

    /** [EDGE CASE] Tidak bisa cancel jika is_accept false (ditolak). */
    public function test_cancel_fails_when_is_accept_false(): void
    {
        $driver = $this->makeDriver();
        $struk = $this->createStruk($driver, ['is_accept' => false]);

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => $struk->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('struk_bensins', ['id' => $struk->id, 'is_accept' => false]);
    }

    /** [UNAUTHORIZED] Driver lain tidak bisa cancel struk milik driver lain. */
    public function test_cancel_fails_when_struk_belongs_to_another_driver(): void
    {
        $driver1 = $this->makeDriver();
        $driver2 = $this->makeDriver();
        $struk = $this->createStruk($driver1);

        $this->actingAs($driver2)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => $struk->id,
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('struk_bensins', ['id' => $struk->id]);
    }

    /** [VALIDATION] Gagal cancel jika struk_bensin_id tidak dikirim. */
    public function test_cancel_fails_without_struk_bensin_id(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.cancel'), [])
            ->assertSessionHasErrors('struk_bensin_id');
    }

    /** [VALIDATION] Gagal cancel jika struk_bensin_id tidak ada di DB. */
    public function test_cancel_fails_with_nonexistent_struk_bensin_id(): void
    {
        $driver = $this->makeDriver();

        $this->actingAs($driver)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => 99999,
            ])
            ->assertSessionHasErrors('struk_bensin_id');
    }

    /** [UNAUTHORIZED] Guest tidak bisa cancel struk bensin. */
    public function test_cancel_requires_auth(): void
    {
        $driver = $this->makeDriver();
        $struk = $this->createStruk($driver);

        $this->post(route('driver.struk-bensin.cancel'), [
            'struk_bensin_id' => $struk->id,
        ])->assertStatus(302);

        $this->assertDatabaseHas('struk_bensins', ['id' => $struk->id]);
    }

    /** [UNAUTHORIZED] Non-driver (Admin) tidak bisa cancel struk bensin driver. */
    public function test_cancel_blocked_for_non_driver(): void
    {
        $admin = $this->makeAdmin();
        $driver = $this->makeDriver();
        $struk = $this->createStruk($driver);

        $this->actingAs($admin)
            ->post(route('driver.struk-bensin.cancel'), [
                'struk_bensin_id' => $struk->id,
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('struk_bensins', ['id' => $struk->id]);
    }
}
