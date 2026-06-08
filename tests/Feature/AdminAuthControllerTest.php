<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Kerusakan;
use App\Models\Keruskaanacc;
use App\Models\Kendaraan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for AdminAuthController.
 *
 * Methods covered:
 *  - showLoginForm()
 *  - login()
 *  - logout()
 *  - updateGambar()
 *  - dashboard()
 */
class AdminAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helper: create a user with a given role
    // -------------------------------------------------------------------------

    private function makeUser(string $role, array $overrides = []): User
    {
        return User::create(array_merge([
            'username' => 'user_' . $role . '_' . uniqid(),
            'role'     => $role,
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $overrides));
    }

    // =========================================================================
    // showLoginForm()
    // =========================================================================

    /**
     * [HAPPY PATH] Guests see the admin login page.
     */
    public function test_show_login_form_renders_for_guest(): void
    {
        // Act
        $response = $this->get(route('admin.login'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/LoginAdmin'));
    }

    /**
     * [REDIRECT] Authenticated Admin is redirected to dashboard,
     * not shown the login form again.
     */
    public function test_show_login_form_redirects_authenticated_admin(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)->get(route('admin.login'));

        // Assert
        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * [EDGE CASE] A Driver who is authenticated sees the login form
     * (not redirected, because role check is 'Admin' only).
     */
    public function test_show_login_form_shows_form_when_non_admin_authenticated(): void
    {
        // Arrange
        $driver = $this->makeUser('Driver');

        // Act
        $response = $this->actingAs($driver)->get(route('admin.login'));

        // Assert – non-admin users are NOT redirected
        $response->assertStatus(200);
    }

    // =========================================================================
    // login()
    // =========================================================================

    /**
     * [HAPPY PATH] Valid Admin credentials log in and redirect to dashboard.
     */
    public function test_login_with_valid_admin_credentials_redirects_to_dashboard(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin', ['key' => 'ABCD1234']);

        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => $admin->username,
            'key'      => 'ABCD1234',
        ]);

        // Assert
        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
    }

    /**
     * [VALIDATION] Missing username returns validation error.
     */
    public function test_login_fails_when_username_is_missing(): void
    {
        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => '',
            'key'      => 'ABCD1234',
        ]);

        // Assert
        $response->assertSessionHasErrors('username');
    }

    /**
     * [VALIDATION] Missing key returns validation error.
     */
    public function test_login_fails_when_key_is_missing(): void
    {
        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => 'someadmin',
            'key'      => '',
        ]);

        // Assert
        $response->assertSessionHasErrors('key');
    }

    /**
     * [VALIDATION] Key that is not exactly 8 characters returns validation error.
     */
    public function test_login_fails_when_key_is_not_8_characters(): void
    {
        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => 'someadmin',
            'key'      => 'SHORT',   // only 5 chars
        ]);

        // Assert
        $response->assertSessionHasErrors('key');
    }

    /**
     * [INVALID CREDENTIALS] Wrong key returns an error back.
     */
    public function test_login_fails_with_wrong_key(): void
    {
        // Arrange
        $this->makeUser('Admin', ['key' => 'ABCD1234']);

        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => 'nonexistent',
            'key'      => 'WRONGKEY',
        ]);

        // Assert
        $response->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /**
     * [UNAUTHORIZED] User exists but is not Admin role.
     */
    public function test_login_fails_when_user_is_not_admin_role(): void
    {
        // Arrange
        $driver = $this->makeUser('Driver', ['key' => 'DRIV1234']);

        // Act
        $response = $this->post(route('admin.login.post'), [
            'username' => $driver->username,
            'key'      => 'DRIV1234',
        ]);

        // Assert
        $response->assertSessionHasErrors('key');
        $this->assertGuest();
    }

    /**
     * [EDGE CASE] Key lookup is case-insensitive (stored as uppercase).
     */
    public function test_login_succeeds_with_lowercase_key_input(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin', ['key' => 'ABCD1234']);

        // Act – send lowercase key
        $response = $this->post(route('admin.login.post'), [
            'username' => $admin->username,
            'key'      => 'abcd1234',
        ]);

        // Assert
        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
    }

    // =========================================================================
    // logout()
    // =========================================================================

    /**
     * [HAPPY PATH] Authenticated Admin can log out.
     */
    public function test_logout_logs_out_admin_and_redirects(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)->post(route('admin.logout'));

        // Assert
        $response->assertRedirect(route('admin.login'));
        $this->assertGuest();
    }

    /**
     * [EDGE CASE] Guest hitting logout still redirects (no crash).
     */
    public function test_logout_from_guest_does_not_crash(): void
    {
        // Act
        $response = $this->post(route('admin.logout'));

        // Assert – redirects or returns a 302 without error
        $response->assertStatus(302);
    }

    // =========================================================================
    // updateGambar()
    // =========================================================================

    /**
     * [HAPPY PATH] Admin can upload a valid profile picture.
     */
    public function test_update_gambar_uploads_image_successfully(): void
    {
        // Arrange
        Storage::fake('public');
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)
            ->post(route('admin.update-gambar'), [
                'gambar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
            ]);

        // Assert
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $admin->refresh();
        $this->assertNotNull($admin->gambar);
        Storage::disk('public')->assertExists($admin->gambar);
    }

    /**
     * [VALIDATION] Missing gambar field returns validation error.
     */
    public function test_update_gambar_fails_when_no_file_provided(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)
            ->post(route('admin.update-gambar'), []);

        // Assert
        $response->assertSessionHasErrors('gambar');
    }

    /**
     * [VALIDATION] Non-image file (PDF) is rejected.
     */
    public function test_update_gambar_fails_with_non_image_file(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)
            ->post(route('admin.update-gambar'), [
                'gambar' => UploadedFile::fake()->create('document.pdf', 500, 'application/pdf'),
            ]);

        // Assert
        $response->assertSessionHasErrors('gambar');
    }

    /**
     * [VALIDATION] Image larger than 2MB is rejected.
     */
    public function test_update_gambar_fails_when_image_exceeds_max_size(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act – 2049 KB > 2048 KB limit
        $response = $this->actingAs($admin)
            ->post(route('admin.update-gambar'), [
                'gambar' => UploadedFile::fake()->image('big.jpg')->size(2049),
            ]);

        // Assert
        $response->assertSessionHasErrors('gambar');
    }

    /**
     * [UNAUTHORIZED] Unauthenticated user cannot access updateGambar.
     */
    public function test_update_gambar_requires_authentication(): void
    {
        // Act
        $response = $this->post(route('admin.update-gambar'), [
            'gambar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        // Assert – redirected to login (middleware)
        $response->assertStatus(302);
        $this->assertGuest();
    }

    /**
     * [EDGE CASE] Old gambar (local storage) is deleted when a new one is uploaded.
     */
    public function test_update_gambar_deletes_old_local_image_on_update(): void
    {
        // Arrange
        Storage::fake('public');
        $admin = $this->makeUser('Admin', ['gambar' => 'users/old-avatar.jpg']);
        Storage::disk('public')->put('users/old-avatar.jpg', 'fake-content');

        // Act
        $this->actingAs($admin)
            ->post(route('admin.update-gambar'), [
                'gambar' => UploadedFile::fake()->image('new-avatar.jpg'),
            ]);

        // Assert – old file deleted
        Storage::disk('public')->assertMissing('users/old-avatar.jpg');
    }

    // =========================================================================
    // dashboard()
    // =========================================================================

    /**
     * [HAPPY PATH] Admin can access the dashboard.
     */
    public function test_dashboard_renders_for_authenticated_admin(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/DashboardAdmin')
            ->has('stats')
            ->has('recentActivities')
            ->has('chartData')
        );
    }

    /**
     * [UNAUTHORIZED] Unauthenticated user cannot access dashboard.
     */
    public function test_dashboard_redirects_unauthenticated_user(): void
    {
        // Act
        $response = $this->get(route('admin.dashboard'));

        // Assert
        $response->assertStatus(302);
        $this->assertGuest();
    }

    /**
     * [UNAUTHORIZED] Driver cannot access admin dashboard.
     */
    public function test_dashboard_is_forbidden_for_driver_role(): void
    {
        // Arrange
        $driver = $this->makeUser('Driver');

        // Act
        $response = $this->actingAs($driver)->get(route('admin.dashboard'));

        // Assert – middleware blocks access
        $response->assertStatus(302);
    }

    /**
     * [EDGE CASE] Dashboard stats are correct when database is empty.
     */
    public function test_dashboard_shows_zero_stats_when_no_data(): void
    {
        // Arrange
        $admin = $this->makeUser('Admin');

        // Act
        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        // Assert – stats should all be "0"
        $response->assertInertia(fn ($page) => $page
            ->where('stats.0.value', '0')  // totalPengajuan
            ->where('stats.1.value', '0')  // perbaikanSelesai
            ->where('stats.2.value', '0')  // pendingReview
        );
    }
}
