<?php

namespace Database\Seeders;

use App\Models\HomepagePromotion;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Database\Seeder;

class HomepagePromotionSeeder extends Seeder
{
    public function run(): void
    {
        $seller = Seller::query()->first();

        if (!$seller) {
            $this->command?->warn('Aucun vendeur trouvé — promotions hero ignorées.');

            return;
        }

        $products = Product::query()
            ->where('seller_id', $seller->id)
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        if ($products->isEmpty()) {
            $this->command?->warn('Aucun produit actif — promotions hero ignorées.');

            return;
        }

        $heroSlides = [
            [
                'order'    => 1,
                'image'    => '/images/demo-products/iphone.jpg',
                'headline' => 'Offre iPhone — Stock limité !',
            ],
            [
                'order'    => 2,
                'image'    => '/images/demo-products/headphones.jpg',
                'headline' => 'Casque Audio — Promo exclusive',
            ],
            [
                'order'    => 3,
                'image'    => '/images/demo-products/samsung.jpg',
                'headline' => 'Samsung Galaxy à prix réduit',
            ],
            [
                'order'    => 4,
                'image'    => '/images/demo-products/speaker.jpg',
                'headline' => 'Enceinte Bluetooth Premium',
            ],
        ];

        foreach ($heroSlides as $index => $slide) {
            $product = $products[$index % $products->count()];

            HomepagePromotion::updateOrCreate(
                ['promotion_order' => $slide['order']],
                [
                    'seller_id'        => $seller->id,
                    'product_id'       => $product->id,
                    'custom_image_url' => $slide['image'],
                    'headline'         => $slide['headline'],
                    'is_active'        => true,
                    'starts_at'        => null,
                    'ends_at'          => null,
                ],
            );
        }

        $this->command?->info('✅ 4 promotions hero configurées (emplacements 1 à 4).');
    }
}
