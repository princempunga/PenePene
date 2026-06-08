<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformSetting;

class PlatformSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name',         'value' => 'PenePene',                      'type' => 'string',  'group' => 'general', 'label' => 'Site Name'],
            ['key' => 'site_tagline',      'value' => 'Your Local Marketplace',         'type' => 'string',  'group' => 'general', 'label' => 'Site Tagline'],
            ['key' => 'site_email',        'value' => 'info@penepene.com',              'type' => 'string',  'group' => 'general', 'label' => 'Contact Email'],
            ['key' => 'site_phone',        'value' => '+255 000 000 000',               'type' => 'string',  'group' => 'general', 'label' => 'Contact Phone'],
            ['key' => 'default_currency',  'value' => 'TZS',                            'type' => 'string',  'group' => 'general', 'label' => 'Default Currency'],
            ['key' => 'default_country',   'value' => 'TZ',                             'type' => 'string',  'group' => 'general', 'label' => 'Default Country'],

            // Features
            ['key' => 'seller_auto_approve',    'value' => '0',  'type' => 'boolean', 'group' => 'features', 'label' => 'Auto-approve Sellers'],
            ['key' => 'review_auto_approve',    'value' => '1',  'type' => 'boolean', 'group' => 'features', 'label' => 'Auto-approve Reviews'],
            ['key' => 'product_auto_approve',   'value' => '0',  'type' => 'boolean', 'group' => 'features', 'label' => 'Auto-approve Products'],
            ['key' => 'enable_messaging',       'value' => '1',  'type' => 'boolean', 'group' => 'features', 'label' => 'Enable Messaging'],
            ['key' => 'enable_reviews',         'value' => '1',  'type' => 'boolean', 'group' => 'features', 'label' => 'Enable Reviews'],
            ['key' => 'nearby_radius_km',       'value' => '50', 'type' => 'integer', 'group' => 'features', 'label' => 'Nearby Products Radius (km)'],

            // SEO
            ['key' => 'meta_description', 'value' => 'PenePene - The best marketplace to buy and sell products locally.', 'type' => 'string', 'group' => 'seo', 'label' => 'Default Meta Description'],
            ['key' => 'meta_keywords',    'value' => 'marketplace, buy, sell, products, local',                          'type' => 'string', 'group' => 'seo', 'label' => 'Default Meta Keywords'],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
