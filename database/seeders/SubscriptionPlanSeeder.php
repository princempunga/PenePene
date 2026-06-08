<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'          => 'Standard',
                'slug'          => 'standard',
                'description'   => 'Perfect for individual sellers getting started.',
                'price'         => 0.00,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'is_active'     => true,
                'is_featured'   => false,
                'sort_order'    => 1,
                'features'      => [
                    'Up to 20 active products',
                    'Order management',
                    'Stock management',
                    'Buyer messaging',
                    'Basic analytics',
                ],
            ],
            [
                'name'          => 'Premium',
                'slug'          => 'premium',
                'description'   => 'For serious sellers who want to grow their business faster.',
                'price'         => 29900.00,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'is_active'     => true,
                'is_featured'   => true,
                'sort_order'    => 2,
                'features'      => [
                    'Unlimited active products',
                    'Order management',
                    'Stock management',
                    'Buyer messaging',
                    'Advanced analytics & market trends',
                    'Detailed sales reports (PDF + Excel)',
                    'Product promotion & sponsorship',
                    'Homepage featured placement',
                    'Priority seller badge',
                ],
            ],
            [
                'name'          => 'Premium Yearly',
                'slug'          => 'premium-yearly',
                'description'   => 'Best value — get 2 months free with yearly billing.',
                'price'         => 299000.00,
                'currency'      => 'TZS',
                'billing_cycle' => 'yearly',
                'duration_days' => 365,
                'is_active'     => true,
                'is_featured'   => false,
                'sort_order'    => 3,
                'features'      => [
                    'All Premium features',
                    '2 months free (vs monthly)',
                    'Priority customer support',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
