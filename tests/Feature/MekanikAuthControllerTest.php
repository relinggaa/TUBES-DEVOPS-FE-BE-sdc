<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for MekanikAuthController.
 * Methods: showLoginForm, login, logout, updateGambar, markAsFull, markAsAvailable
 */
class MekanikAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'u_' . $role . '_' . uniqid(),
            'role'     => $role,
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    // showLoginForm -----------------------------------------------------------

    /** [HAPPY PATH] Guest sees mekanik login page. */
    public function test_show_login_form_renders_for_guest(): void
    {
        $this->get(route('mekanik.login'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Mekanik/LoginMekanik'));
    }

    /** [REDIRECT] Authenticated Mekanik is redirected to dashboard. */
    public function test_show_login_form_redirects_authenticated_mekanik(): void
    {
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)->get(route('mekanik.login'))
            ->assertRedirect(route('mekanik.dashboard'));
    }

    /** [EDGE CASE] Non-mekanik (Driver) sees login form. */
    public function test_show_login_form_shows_for_non_mekanik(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->get(route('mekanik.login'))
            ->assertStatus(200);
    }

    // login -------------------------------------------------------------------

    /** [HAPPY PATH] Valid credentials log in and redirect. */
    public function test_login_valid_credentials_redirects_to_dashboard(): void
    {
        $mekanik = $this->makeUser('Mekanik', ['key' => 'MEKN1234']);
        $this->post(route('mekanik.login.post'), [
            'username' => $mekanik->username,
            'key'      => 'MEKN1234',
        ])->assertRedirect(route('mekanik.dashboard'));
        $this->assertAuthenticatedAs($mekanik);
    }

    /** [VALIDATION] Missing username. */
    public function test_login_fails_without_username(): void
    {
        $this->post(route('mekanik.login.post'), ['username' => '', 'key' => 'MEKN1234'])
            ->assertSessionHasErrors('username');
    }

    /** [VALIDATION] Key not 8 chars. */
    public function test_login_fails_with_short_key(): void
    {
        $this->post(route('mekanik.login.post'), ['username' => 'x', 'key' => 'SHORT'])
            ->assertSessionHasErrors('key');
    }

    /** [INVALID CREDS] Wrong credentials. */
    public function test_login_fails_with_wrong_credentials(): void
    {
        $this->post(route('mekanik.login.post'), ['username' => 'nobody', 'key' => 'WRONGKEY'])
            ->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] User exists but is not Mekanik. */
    public function test_login_fails_for_non_mekanik_role(): void
    {
        $driver = $this->makeUser('Driver', ['key' => 'DRIV1234']);
        $this->post(route('mekanik.login.post'), ['username' => $driver->username, 'key' => 'DRIV1234'])
            ->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /** [EDGE CASE] Lowercase key is accepted (comparison after strtoupper). */
    public function test_login_succeeds_with_lowercase_key(): void
    {
        $mekanik = $this->makeUser('Mekanik', ['key' => 'MEKN1234']);
        $this->post(route('mekanik.login.post'), ['username' => $mekanik->username, 'key' => 'mekn1234'])
            ->assertRedirect(route('mekanik.dashboard'));
    }

    // logout ------------------------------------------------------------------

    /** [HAPPY PATH] Mekanik can log out. */
    public function test_logout_redirects_to_mekanik_login(): void
    {
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)->post(route('mekanik.logout'))
            ->assertRedirect(route('mekanik.login'));
        $this->assertGuest();
    }

    // updateGambar ------------------------------------------------------------

    /** [HAPPY PATH] Valid image uploaded successfully. */
    public function test_update_gambar_stores_image(): void
    {
        Storage::fake('public');
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)
            ->post(route('mekanik.update-gambar'), ['gambar' => UploadedFile::fake()->image('p.jpg')])
            ->assertSessionHas('success');
        $mekanik->refresh();
        Storage::disk('public')->assertExists($mekanik->gambar);
    }

    /** [VALIDATION] No file provided. */
    public function test_update_gambar_fails_without_file(): void
    {
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)->post(route('mekanik.update-gambar'), [])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] Non-image file rejected. */
    public function test_update_gambar_fails_with_non_image(): void
    {
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)
            ->post(route('mekanik.update-gambar'), ['gambar' => UploadedFile::fake()->create('f.pdf', 10, 'application/pdf')])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] File larger than 2MB rejected. */
    public function test_update_gambar_fails_when_too_large(): void
    {
        $mekanik = $this->makeUser('Mekanik');
        $this->actingAs($mekanik)
            ->post(route('mekanik.update-gambar'), ['gambar' => UploadedFile::fake()->image('big.jpg')->size(2049)])
            ->assertSessionHasErrors('gambar');
    }

    /** [UNAUTHORIZED] Guest cannot update gambar. */
    public function test_update_gambar_requires_auth(): void
    {
        $this->post(route('mekanik.update-gambar'), ['gambar' => UploadedFile::fake()->image('a.jpg')])
            ->assertStatus(302);
        $this->assertGuest();
    }

    /** [EDGE CASE] Old local gambar is deleted on new upload. */
    public function test_update_gambar_deletes_old_local_file(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('profile-pictures/old.jpg', 'data');
        $mekanik = $this->makeUser('Mekanik', ['gambar' => 'profile-pictures/old.jpg']);
        $this->actingAs($mekanik)
            ->post(route('mekanik.update-gambar'), ['gambar' => UploadedFile::fake()->image('new.jpg')]);
        Storage::disk('public')->assertMissing('profile-pictures/old.jpg');
    }

    // markAsFull --------------------------------------------------------------

    /** [HAPPY PATH] Mekanik can mark themselves as full. */
    public function test_mark_as_full_updates_status_to_full(): void
    {
        $mekanik = $this->makeUser('Mekanik', ['status' => 'available']);
        $this->actingAs($mekanik)->post(route('mekanik.mark-as-full'))
            ->assertRedirect(route('mekanik.dashboard'))
            ->assertSessionHas('success');
        $this->assertEquals('full', $mekanik->fresh()->status);
    }

    /** [UNAUTHORIZED] Guest cannot mark as full. */
    public function test_mark_as_full_requires_auth(): void
    {
        $this->post(route('mekanik.mark-as-full'))->assertStatus(302);
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] Non-mekanik role is blocked by middleware. */
    public function test_mark_as_full_blocked_for_driver(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->post(route('mekanik.mark-as-full'))
            ->assertStatus(302); // middleware redirect
    }

    // markAsAvailable ---------------------------------------------------------

    /** [HAPPY PATH] Mekanik can mark themselves as available. */
    public function test_mark_as_available_updates_status_to_available(): void
    {
        $mekanik = $this->makeUser('Mekanik', ['status' => 'full']);
        $this->actingAs($mekanik)->post(route('mekanik.mark-as-available'))
            ->assertRedirect(route('mekanik.dashboard'))
            ->assertSessionHas('success');
        $this->assertEquals('available', $mekanik->fresh()->status);
    }

    /** [UNAUTHORIZED] Guest cannot mark as available. */
    public function test_mark_as_available_requires_auth(): void
    {
        $this->post(route('mekanik.mark-as-available'))->assertStatus(302);
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] Non-mekanik role is blocked by middleware. */
    public function test_mark_as_available_blocked_for_driver(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->post(route('mekanik.mark-as-available'))
            ->assertStatus(302);
    }
}
