<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Crée ou met à jour le compte Super Admin.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'josephtshim9@gmail.com'],
            [
                'name' => 'Joseph Tshimpanga',
                'password' => Hash::make('Josephes6@'),
                'phone' => '+256705507066',
                'role' => 'super_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $this->command->info('Super Admin créé/mis à jour : josephtshim9@gmail.com');
    }
}
