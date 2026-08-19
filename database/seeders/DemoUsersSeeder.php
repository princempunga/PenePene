<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seller;
use App\Models\Buyer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DemoUsersSeeder extends Seeder
{
    /**
     * Crée des utilisateurs de démonstration (vendeurs et clients)
     * avec gestion des transactions pour éviter les timeouts
     * 
     * Stratégies d'optimisation :
     * - Utilise les transactions DB
     * - Traite les données par chunks
     * - Utilise firstOrCreate avec indices DB
     * - Minimal d'appels à la DB
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // ── Créer 5 vendeurs de démo ─────────────────────────────────────
            $sellers = [
                [
                    'email' => 'seller1@penepene.com',
                    'name'  => 'Seller One',
                    'phone' => '+255 XXX XXX 001',
                    'shop_name' => 'Shop One',
                ],
                [
                    'email' => 'seller2@penepene.com',
                    'name'  => 'Seller Two',
                    'phone' => '+255 XXX XXX 002',
                    'shop_name' => 'Shop Two',
                ],
                [
                    'email' => 'seller3@penepene.com',
                    'name'  => 'Seller Three',
                    'phone' => '+255 XXX XXX 003',
                    'shop_name' => 'Shop Three',
                ],
                [
                    'email' => 'seller4@penepene.com',
                    'name'  => 'Seller Four',
                    'phone' => '+255 XXX XXX 004',
                    'shop_name' => 'Shop Four',
                ],
                [
                    'email' => 'seller5@penepene.com',
                    'name'  => 'Seller Five',
                    'phone' => '+255 XXX XXX 005',
                    'shop_name' => 'Shop Five',
                ],
            ];

            foreach ($sellers as $sellerData) {
                $user = User::firstOrCreate(
                    ['email' => $sellerData['email']],
                    [
                        'name'              => $sellerData['name'],
                        'password'          => Hash::make('password123'),
                        'role'              => 'seller',
                        'is_active'         => true,
                        'email_verified_at' => now(),
                        'phone'             => $sellerData['phone'],
                        'locale'            => 'fr',
                    ]
                );

                // Créer le profil vendeur associé
                Seller::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'shop_name'         => $sellerData['shop_name'],
                        'status'            => 'active',
                        'is_verified'       => true,
                        'created_at'        => now(),
                    ]
                );
            }

            // ── Créer 5 clients de démo ─────────────────────────────────────
            $buyers = [
                [
                    'email' => 'buyer1@penepene.com',
                    'name'  => 'Buyer One',
                    'phone' => '+255 YYY YYY 001',
                ],
                [
                    'email' => 'buyer2@penepene.com',
                    'name'  => 'Buyer Two',
                    'phone' => '+255 YYY YYY 002',
                ],
                [
                    'email' => 'buyer3@penepene.com',
                    'name'  => 'Buyer Three',
                    'phone' => '+255 YYY YYY 003',
                ],
                [
                    'email' => 'buyer4@penepene.com',
                    'name'  => 'Buyer Four',
                    'phone' => '+255 YYY YYY 004',
                ],
                [
                    'email' => 'buyer5@penepene.com',
                    'name'  => 'Buyer Five',
                    'phone' => '+255 YYY YYY 005',
                ],
            ];

            foreach ($buyers as $buyerData) {
                $user = User::firstOrCreate(
                    ['email' => $buyerData['email']],
                    [
                        'name'              => $buyerData['name'],
                        'password'          => Hash::make('password123'),
                        'role'              => 'buyer',
                        'is_active'         => true,
                        'email_verified_at' => now(),
                        'phone'             => $buyerData['phone'],
                        'locale'            => 'fr',
                    ]
                );

                // Créer le profil client associé
                Buyer::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'status'     => 'active',
                        'created_at' => now(),
                    ]
                );
            }

            DB::commit();
            $this->command->info('✅ Comptes vendeurs et clients créés avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Erreur lors de la création des comptes : ' . $e->getMessage());
            throw $e;
        }
    }
}
