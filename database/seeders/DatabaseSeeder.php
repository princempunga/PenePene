<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Buyer;
use App\Models\Seller;
use App\Models\SubscriptionPlan;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Platform Settings ─────────────────────────────────────────────────
        $settings = [
            ['key' => 'site_name',         'value' => 'PenePene',             'type' => 'string',  'group' => 'general',  'label' => 'Site Name'],
            ['key' => 'default_currency',  'value' => 'TZS',                  'type' => 'string',  'group' => 'general',  'label' => 'Default Currency'],
            ['key' => 'commission_rate',   'value' => '10',                   'type' => 'integer', 'group' => 'finance',  'label' => 'Commission Rate (%)'],
            ['key' => 'platform_fee',      'value' => '500',                  'type' => 'integer', 'group' => 'finance',  'label' => 'Platform Fee (TZS)'],
            ['key' => 'contact_email',     'value' => 'support@penepene.co.tz','type' => 'string',  'group' => 'contact',  'label' => 'Contact Email'],
            ['key' => 'contact_phone',     'value' => '+255 XXX XXX XXX',     'type' => 'string',  'group' => 'contact',  'label' => 'Contact Phone'],
            ['key' => 'maintenance_mode',  'value' => '0',                    'type' => 'boolean', 'group' => 'general',  'label' => 'Maintenance Mode'],
            ['key' => 'default_language',  'value' => 'sw',                   'type' => 'string',  'group' => 'general',  'label' => 'Default Language'],
        ];
        foreach ($settings as $setting) {
            PlatformSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }

        // ── Subscription Plans ─────────────────────────────────────────────────
        $plans = [
            [
                'name'          => 'Free',
                'slug'          => 'free',
                'description'   => 'Get started selling on PenePene at no cost.',
                'price'         => 0,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'is_active'     => true,
                'is_featured'   => false,
                'sort_order'    => 1,
                'features'      => ['Up to 10 products', 'Basic analytics', 'Standard support'],
            ],
            [
                'name'          => 'Standard',
                'slug'          => 'standard',
                'description'   => 'For growing sellers who need more exposure.',
                'price'         => 29900,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'is_active'     => true,
                'is_featured'   => true,
                'sort_order'    => 2,
                'features'      => ['Up to 100 products', 'Advanced analytics', 'Priority support', '1 sponsored slot'],
            ],
            [
                'name'          => 'Premium',
                'slug'          => 'premium',
                'description'   => 'The ultimate plan for serious sellers.',
                'price'         => 79900,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'is_active'     => true,
                'is_featured'   => false,
                'sort_order'    => 3,
                'features'      => ['Unlimited products', 'Full analytics & reports', 'Dedicated support', '5 sponsored slots', 'Featured store badge'],
            ],
        ];
        foreach ($plans as $plan) {
            $features = $plan['features'];
            unset($plan['features']);
            SubscriptionPlan::firstOrCreate(['slug' => $plan['slug']], array_merge($plan, ['features' => json_encode($features)]));
        }

        // ── Categories ─────────────────────────────────────────────────────────
        $categories = [
            ['name' => 'Electronics',    'subcats' => ['Phones & Tablets', 'Computers', 'Accessories', 'Audio & Video']],
            ['name' => 'Fashion',        'subcats' => ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags & Accessories']],
            ['name' => 'Home & Garden',  'subcats' => ['Furniture', 'Kitchen', 'Garden', 'Decor']],
            ['name' => 'Food & Drinks',  'subcats' => ['Fresh Produce', 'Beverages', 'Snacks', 'Grains & Cereals']],
            ['name' => 'Health & Beauty','subcats' => ['Skincare', 'Hair Care', 'Health Supplements', 'Baby & Kids']],
            ['name' => 'Vehicles',       'subcats' => ['Cars', 'Motorcycles', 'Spare Parts', 'Trucks']],
            ['name' => 'Real Estate',    'subcats' => ['Houses for Sale', 'Houses for Rent', 'Land', 'Commercial Property']],
            ['name' => 'Services',       'subcats' => ['Cleaning', 'Repairs', 'Tutoring', 'Events & Catering']],
        ];

        foreach ($categories as $cat) {
            $catSlug = Str::slug($cat['name']);
            $category = Category::firstOrCreate(
                ['slug' => $catSlug],
                ['name' => $cat['name'], 'slug' => $catSlug, 'is_active' => true]
            );
            foreach ($cat['subcats'] as $subName) {
                // Prefix with category slug to ensure global uniqueness
                $subSlug = $catSlug . '-' . Str::slug($subName);
                Subcategory::firstOrCreate(
                    ['slug' => $subSlug, 'category_id' => $category->id],
                    ['name' => $subName, 'slug' => $subSlug, 'category_id' => $category->id, 'is_active' => true]
                );
            }
        }

        // ── Super Admin ────────────────────────────────────────────────────────
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@penepene.co.tz'],
            [
                'name'              => 'Super Admin',
                'email'             => 'superadmin@penepene.co.tz',
                'phone'             => '+255700000001',
                'password'          => Hash::make('password'),
                'role'              => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // ── Standard Admin ─────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@penepene.co.tz'],
            [
                'name'              => 'Platform Admin',
                'email'             => 'admin@penepene.co.tz',
                'phone'             => '+255700000002',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // ── Demo Buyer ─────────────────────────────────────────────────────────
        $buyerUser = User::firstOrCreate(
            ['email' => 'buyer@penepene.co.tz'],
            [
                'name'              => 'Demo Buyer',
                'email'             => 'buyer@penepene.co.tz',
                'phone'             => '+255700000003',
                'password'          => Hash::make('password'),
                'role'              => 'buyer',
                'email_verified_at' => now(),
            ]
        );
        Buyer::firstOrCreate(['user_id' => $buyerUser->id], [
            'user_id' => $buyerUser->id,
            'city'    => 'Dar es Salaam',
            'country' => 'Tanzania',
        ]);

        // ── Demo Seller ────────────────────────────────────────────────────────
        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@penepene.co.tz'],
            [
                'name'              => 'Demo Seller',
                'email'             => 'seller@penepene.co.tz',
                'phone'             => '+255700000004',
                'password'          => Hash::make('password'),
                'role'              => 'seller',
                'email_verified_at' => now(),
            ]
        );
        Seller::firstOrCreate(['user_id' => $sellerUser->id], [
            'user_id'       => $sellerUser->id,
            'business_name' => 'Demo Store',
            'slug'          => 'demo-store',
            'description'   => 'A demo seller store for testing PenePene.',
            'city'          => 'Dar es Salaam',
            'country'       => 'TZ',
            'status'        => 'verified',
            'verified_at'   => now(),
            'verified_by'   => $superAdmin->id,
        ]);

        $this->command->info('✅ PenePene seeding complete!');
        $this->command->info('');
        $this->command->info('  Super Admin: superadmin@penepene.co.tz  / password');
        $this->command->info('  Admin:       admin@penepene.co.tz       / password');
        $this->command->info('  Buyer:       buyer@penepene.co.tz       / password');
        $this->command->info('  Seller:      seller@penepene.co.tz      / password');
    }
}
