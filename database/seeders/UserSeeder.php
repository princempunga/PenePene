<?php

namespace Database\Seeders;

use App\Models\Buyer;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $superAdmin = User::updateOrCreate(
                ['email' => 'josephtshim9@gmail.com'],
                [
                    'name'              => 'Super Admin',
                    'password'          => Hash::make('Josephes6@'),
                    'role'              => 'super_admin',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                    'locale'            => 'fr',
                ]
            );

            User::updateOrCreate(
                ['email' => 'admin@penepene.com'],
                [
                    'name'              => 'Admin User',
                    'password'          => Hash::make('password'),
                    'role'              => 'admin',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                    'locale'            => 'fr',
                ]
            );

            $sellerUser = User::updateOrCreate(
                ['email' => 'seller.test@penepene.com'],
                [
                    'name'              => 'Test Seller',
                    'password'          => Hash::make('password'),
                    'role'              => 'seller',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                    'locale'            => 'fr',
                ]
            );

            Seller::updateOrCreate(
                ['user_id' => $sellerUser->id],
                [
                    'user_id'     => $sellerUser->id,
                    'business_name' => 'Demo Store',
                    'slug'        => 'demo-store',
                    'description' => 'Compte vendeur de test pour la plateforme.',
                    'phone'       => '+255700000004',
                    'city'        => 'Dar es Salaam',
                    'province'    => 'Dar es Salaam',
                    'country'     => 'TZ',
                    'status'      => 'verified',
                    'verified_at' => now(),
                    'verified_by' => $superAdmin->id,
                ]
            );

            $buyerUser = User::updateOrCreate(
                ['email' => 'buyer.test@penepene.com'],
                [
                    'name'              => 'Test Buyer',
                    'password'          => Hash::make('password'),
                    'role'              => 'buyer',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                    'locale'            => 'fr',
                ]
            );

            Buyer::updateOrCreate(
                ['user_id' => $buyerUser->id],
                [
                    'user_id' => $buyerUser->id,
                    'address' => '123 Avenue du Test',
                    'city'    => 'Kinshasa',
                    'province'=> 'Kinshasa',
                    'country' => 'CD',
                ]
            );
        });
    }
}
