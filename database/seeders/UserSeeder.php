<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Seller;
use App\Models\Buyer;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@penepene.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // 2. Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@penepene.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // 3. Demo Seller
        $sellerUser = User::create([
            'name' => 'Demo Seller',
            'email' => 'seller@penepene.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Tech Store Tz',
            'description' => 'The best electronics store.',
            'phone' => '+255123456789',
            'address' => '123 Market St',
            'city' => 'Dar es Salaam',
            'country' => 'TZ',
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => 1, // Super admin ID
        ]);

        // 4. Demo Buyer
        $buyerUser = User::create([
            'name' => 'Demo Buyer',
            'email' => 'buyer@penepene.com',
            'password' => Hash::make('password'),
            'role' => 'buyer',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        Buyer::create([
            'user_id' => $buyerUser->id,
            'address' => '456 Residential Ave',
            'city' => 'Dar es Salaam',
            'country' => 'TZ',
        ]);
    }
}
