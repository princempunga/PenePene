<?php

namespace Tests\Feature;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name'              => 'Jean Vendeur',
            'email'             => 'jean.vendeur@test.com',
            'password'          => 'password123',
            'password_confirmation' => 'password123',
            'phone'             => '+243900000000',
            'business_name'     => 'Boutique Jean',
            'address'           => '12 Avenue du Commerce',
            'city'              => 'Kinshasa',
            'country'           => 'RD Congo',
        ], $overrides);
    }

    public function test_registration_fails_with_a_clear_error_when_country_is_missing(): void
    {
        $response = $this->postJson('/seller/register', $this->validPayload(['country' => '']));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['country']);
        $response->assertJsonFragment(['country' => ['Le pays est obligatoire.']]);

        // Ni le User ni le Seller ne doivent survivre à l'échec de validation.
        $this->assertDatabaseMissing('users', ['email' => 'jean.vendeur@test.com']);
        $this->assertSame(0, Seller::count());
    }

    public function test_registration_succeeds_when_country_is_provided(): void
    {
        $response = $this->post('/seller/register', $this->validPayload());

        $response->assertRedirect(route('seller.dashboard'));

        $user = User::where('email', 'jean.vendeur@test.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('seller', $user->role);

        $seller = Seller::where('user_id', $user->id)->first();
        $this->assertNotNull($seller);
        $this->assertSame('RD Congo', $seller->country);
    }
}
