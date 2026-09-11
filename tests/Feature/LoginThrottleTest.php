<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        User::create([
            'name' => 'Cible Test',
            'email' => 'cible@test.com',
            'password' => bcrypt('the-real-password'),
            'role' => 'buyer',
        ]);

        $attempt = fn () => $this->post(route('login'), [
            'email' => 'cible@test.com',
            'password' => 'wrong-password',
        ]);

        // 5 tentatives autorisées par throttle:5,1 — toutes rejetées pour
        // mauvais mot de passe, mais pas encore par le rate limit.
        for ($i = 0; $i < 5; $i++) {
            $attempt()->assertSessionHasErrors('email');
        }

        // La 6e tentative doit être bloquée par le throttle (429), avant
        // même que le contrôleur ne vérifie les identifiants.
        $attempt()->assertStatus(429);
    }
}
