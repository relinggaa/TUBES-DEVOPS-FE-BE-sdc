<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for DriverAuthController.
 * Methods: showLoginForm, login, logout, updateGambar
 */
class DriverAuthControllerTest extends TestCase
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

    /** [HAPPY PATH] Guest sees driver login page. */
    public function test_show_login_form_renders_for_guest(): void
    {
        $this->get(route('driver.login'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Driver/LoginDriver'));
    }

    /** [REDIRECT] Authenticated Driver is redirected to dashboard. */
    public function test_show_login_form_redirects_authenticated_driver(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->get(route('driver.login'))
            ->assertRedirect(route('driver.dashboard'));
    }

    /** [EDGE CASE] Non-driver (Admin) sees login form. */
    public function test_show_login_form_shows_for_non_driver(): void
    {
        $admin = $this->makeUser('Admin');
        $this->actingAs($admin)->get(route('driver.login'))
            ->assertStatus(200);
    }

    // login -------------------------------------------------------------------

    /** [HAPPY PATH] Valid credentials authenticate and redirect. */
    public function test_login_valid_credentials_redirects_to_dashboard(): void
    {
        $driver = $this->makeUser('Driver', ['key' => 'DRIV1234']);
        $this->post(route('driver.login.post'), [
            'username' => $driver->username,
            'key'      => 'DRIV1234',
        ])->assertRedirect(route('driver.dashboard'));
        $this->assertAuthenticatedAs($driver);
    }

    /** [VALIDATION] Missing username. */
    public function test_login_fails_without_username(): void
    {
        $this->post(route('driver.login.post'), ['username' => '', 'key' => 'DRIV1234'])
            ->assertSessionHasErrors('username');
    }

    /** [VALIDATION] Key shorter than 8 chars. */
    public function test_login_fails_with_short_key(): void
    {
        $this->post(route('driver.login.post'), ['username' => 'x', 'key' => 'SHORT'])
            ->assertSessionHasErrors('key');
    }

    /** [INVALID CREDS] Wrong username/key pair. */
    public function test_login_fails_with_wrong_credentials(): void
    {
        $this->post(route('driver.login.post'), ['username' => 'nobody', 'key' => 'WRONGKEY'])
            ->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] User exists but is not Driver. */
    public function test_login_fails_for_non_driver_role(): void
    {
        $admin = $this->makeUser('Admin', ['key' => 'ADMN1234']);
        $this->post(route('driver.login.post'), ['username' => $admin->username, 'key' => 'ADMN1234'])
            ->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /** [EDGE CASE] Key lookup is case-insensitive. */
    public function test_login_succeeds_with_lowercase_key(): void
    {
        $driver = $this->makeUser('Driver', ['key' => 'DRIV1234']);
        $this->post(route('driver.login.post'), ['username' => $driver->username, 'key' => 'driv1234'])
            ->assertRedirect(route('driver.dashboard'));
    }

    // logout ------------------------------------------------------------------

    /** [HAPPY PATH] Driver logs out and is redirected to login. */
    public function test_logout_redirects_to_driver_login(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->post(route('driver.logout'))
            ->assertRedirect(route('driver.login'));
        $this->assertGuest();
    }

    // updateGambar ------------------------------------------------------------

    /** [HAPPY PATH] Valid image upload succeeds. */
    public function test_update_gambar_stores_image(): void
    {
        Storage::fake('public');
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)
            ->post(route('driver.update-gambar'), ['gambar' => UploadedFile::fake()->image('p.jpg')])
            ->assertRedirect(route('driver.dashboard'))
            ->assertSessionHas('success');
        $driver->refresh();
        Storage::disk('public')->assertExists($driver->gambar);
    }

    /** [VALIDATION] No file uploaded. */
    public function test_update_gambar_fails_without_file(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->post(route('driver.update-gambar'), [])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] Non-image file rejected. */
    public function test_update_gambar_fails_with_pdf(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)
            ->post(route('driver.update-gambar'), ['gambar' => UploadedFile::fake()->create('f.pdf', 10, 'application/pdf')])
            ->assertSessionHasErrors('gambar');
    }

    /** [VALIDATION] File exceeding 2MB rejected. */
    public function test_update_gambar_fails_when_file_too_large(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)
            ->post(route('driver.update-gambar'), ['gambar' => UploadedFile::fake()->image('big.jpg')->size(2049)])
            ->assertSessionHasErrors('gambar');
    }

    /** [UNAUTHORIZED] Guest cannot update gambar. */
    public function test_update_gambar_requires_auth(): void
    {
        $this->post(route('driver.update-gambar'), ['gambar' => UploadedFile::fake()->image('a.jpg')])
            ->assertStatus(302);
        $this->assertGuest();
    }

    /** [EDGE CASE] Old local image is deleted on update. */
    public function test_update_gambar_deletes_old_image(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('users/old.jpg', 'data');
        $driver = $this->makeUser('Driver', ['gambar' => 'users/old.jpg']);
        $this->actingAs($driver)
            ->post(route('driver.update-gambar'), ['gambar' => UploadedFile::fake()->image('new.jpg')]);
        Storage::disk('public')->assertMissing('users/old.jpg');
    }
}
