<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for GenerateKeyController.
 * Methods: index, store, update, destroy
 * All routes are protected by 'admin' middleware.
 */
class GenerateKeyControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'admin_' . uniqid(),
            'role'     => 'Admin',
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    private function makeUser(string $role, array $extra = []): User
    {
        return User::create(array_merge([
            'username' => 'u_' . uniqid(),
            'role'     => $role,
            'key'      => strtoupper(bin2hex(random_bytes(4))),
        ], $extra));
    }

    // index -------------------------------------------------------------------

    /** [HAPPY PATH] Admin can view generate-key page. */
    public function test_index_renders_for_admin(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get(route('generate-key.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/GenerateKey')->has('users')->has('filters'));
    }

    /** [UNAUTHORIZED] Guest is redirected. */
    public function test_index_requires_auth(): void
    {
        $this->get(route('generate-key.index'))->assertStatus(302);
        $this->assertGuest();
    }

    /** [UNAUTHORIZED] Non-admin cannot access. */
    public function test_index_blocked_for_non_admin(): void
    {
        $driver = $this->makeUser('Driver');
        $this->actingAs($driver)->get(route('generate-key.index'))->assertStatus(302);
    }

    /** [HAPPY PATH] Search filter works without crashing. */
    public function test_index_accepts_search_param(): void
    {
        $admin = $this->makeAdmin();
        $this->makeUser('Driver', ['username' => 'driver_xyz']);
        $response = $this->actingAs($admin)
            ->get(route('generate-key.index', ['search' => 'xyz']));
        $response->assertStatus(200);
    }

    /** [HAPPY PATH] Role filter works. */
    public function test_index_accepts_filter_role_param(): void
    {
        $admin = $this->makeAdmin();
        $response = $this->actingAs($admin)
            ->get(route('generate-key.index', ['filter_role' => 'Driver']));
        $response->assertStatus(200);
    }

    // store -------------------------------------------------------------------

    /** [HAPPY PATH] Admin can create a new user. */
    public function test_store_creates_user_with_valid_data(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'newdriver',
            'role'     => 'Driver',
            'key'      => 'NEWKEY12',
        ])->assertRedirect(route('generate-key.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['username' => 'newdriver', 'role' => 'Driver']);
    }

    /** [VALIDATION] Missing username. */
    public function test_store_fails_without_username(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => '',
            'role'     => 'Driver',
            'key'      => 'NEWKEY12',
        ])->assertSessionHasErrors('username');
    }

    /** [VALIDATION] Missing role. */
    public function test_store_fails_without_role(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'newdriver',
            'role'     => '',
            'key'      => 'NEWKEY12',
        ])->assertSessionHasErrors('role');
    }

    /** [VALIDATION] Invalid role value. */
    public function test_store_fails_with_invalid_role(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'newdriver',
            'role'     => 'Superuser',
            'key'      => 'NEWKEY12',
        ])->assertSessionHasErrors('role');
    }

    /** [VALIDATION] Key not exactly 8 characters. */
    public function test_store_fails_when_key_not_8_chars(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'newdriver',
            'role'     => 'Driver',
            'key'      => 'SHORT',
        ])->assertSessionHasErrors('key');
    }

    /** [VALIDATION] Duplicate username. */
    public function test_store_fails_with_duplicate_username(): void
    {
        $admin = $this->makeAdmin();
        $this->makeUser('Driver', ['username' => 'existinguser', 'key' => 'EXIST123']);
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'existinguser',
            'role'     => 'Driver',
            'key'      => 'NEWKEY99',
        ])->assertSessionHasErrors('username');
    }

    /** [VALIDATION] Duplicate key. */
    public function test_store_fails_with_duplicate_key(): void
    {
        $admin = $this->makeAdmin();
        $this->makeUser('Driver', ['username' => 'existinguser2', 'key' => 'DUPKEY12']);
        $this->actingAs($admin)->post(route('generate-key.store'), [
            'username' => 'anotheruser',
            'role'     => 'Driver',
            'key'      => 'DUPKEY12',
        ])->assertSessionHasErrors('key');
    }

    /** [UNAUTHORIZED] Guest cannot store. */
    public function test_store_requires_auth(): void
    {
        $this->post(route('generate-key.store'), [
            'username' => 'x',
            'role'     => 'Driver',
            'key'      => 'ABCD1234',
        ])->assertStatus(302);
        $this->assertGuest();
    }

    // update ------------------------------------------------------------------

    /** [HAPPY PATH] Admin can update an existing user. */
    public function test_update_updates_user_with_valid_data(): void
    {
        $admin  = $this->makeAdmin();
        $target = $this->makeUser('Driver', ['username' => 'oldname', 'key' => 'OLDKEY12']);
        $this->actingAs($admin)->put(route('generate-key.update', $target->id), [
            'username' => 'newname',
            'role'     => 'Mekanik',
            'key'      => 'NEWKEY12',
        ])->assertRedirect(route('generate-key.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['id' => $target->id, 'username' => 'newname', 'role' => 'Mekanik']);
    }

    /** [VALIDATION] Username missing on update. */
    public function test_update_fails_without_username(): void
    {
        $admin  = $this->makeAdmin();
        $target = $this->makeUser('Driver');
        $this->actingAs($admin)->put(route('generate-key.update', $target->id), [
            'username' => '',
            'role'     => 'Driver',
            'key'      => 'ABCD1234',
        ])->assertSessionHasErrors('username');
    }

    /** [VALIDATION] Invalid role on update. */
    public function test_update_fails_with_invalid_role(): void
    {
        $admin  = $this->makeAdmin();
        $target = $this->makeUser('Driver');
        $this->actingAs($admin)->put(route('generate-key.update', $target->id), [
            'username' => 'x',
            'role'     => 'BadRole',
            'key'      => 'ABCD1234',
        ])->assertSessionHasErrors('role');
    }

    /** [EDGE CASE] Updating user with their own existing key does not fail unique check. */
    public function test_update_allows_keeping_same_key(): void
    {
        $admin  = $this->makeAdmin();
        $target = $this->makeUser('Driver', ['key' => 'SAME1234']);
        $this->actingAs($admin)->put(route('generate-key.update', $target->id), [
            'username' => $target->username,
            'role'     => 'Driver',
            'key'      => 'SAME1234',
        ])->assertRedirect(route('generate-key.index'));
    }

    /** [EDGE CASE] 404 when user not found. */
    public function test_update_returns_404_for_nonexistent_user(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->put(route('generate-key.update', 99999), [
            'username' => 'x',
            'role'     => 'Driver',
            'key'      => 'ABCD1234',
        ])->assertStatus(404);
    }

    // destroy -----------------------------------------------------------------

    /** [HAPPY PATH] Admin can delete a user. */
    public function test_destroy_deletes_user(): void
    {
        $admin  = $this->makeAdmin();
        $target = $this->makeUser('Driver');
        $this->actingAs($admin)->delete(route('generate-key.destroy', $target->id))
            ->assertRedirect(route('generate-key.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    /** [EDGE CASE] 404 when deleting non-existent user. */
    public function test_destroy_returns_404_for_nonexistent_user(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->delete(route('generate-key.destroy', 99999))
            ->assertStatus(404);
    }

    /** [UNAUTHORIZED] Guest cannot delete. */
    public function test_destroy_requires_auth(): void
    {
        $target = $this->makeUser('Driver');
        $this->delete(route('generate-key.destroy', $target->id))->assertStatus(302);
        $this->assertGuest();
    }
}
