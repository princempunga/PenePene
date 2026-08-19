<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Crée un compte Super Admin et Admin par défaut
     * Cette opération est idempotente (safe = pas de doublons)
     */
    public function run(): void
    {
        // ── Super Admin ─────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'josephtshim6@gmail.com'],
            [
                'name'          => 'Joseph Tshim',
                'password'      => Hash::make('Josephes6@'),
                'role'          => 'super_admin',
                'is_active'     => true,
                'email_verified_at' => now(),
                'locale'        => 'fr',
            ]
        );

        // ── Admin ─────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@penepene.com'],
            [
                'name'          => 'Admin User',
                'password'      => Hash::make('password'),
                'role'          => 'admin',
                'is_active'     => true,
                'email_verified_at' => now(),
                'locale'        => 'fr',
            ]
        );

        $this->command->info('✅ Comptes Super Admin et Admin créés avec succès !');
    }
}
