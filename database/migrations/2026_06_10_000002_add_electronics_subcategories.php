<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Support\Str;

return new class extends Migration
{
    private array $subcategoryMeta = [
        'mobile-phones' => ['description' => 'Smartphones and mobile devices from top brands.', 'image' => '/images/categories/electronics-mobile-phones.jpg'],
        'laptops-computers' => ['description' => 'Laptops, desktops, and computer accessories.', 'image' => '/images/categories/electronics-laptops-computers.jpg'],
        'accessories' => ['description' => 'Cases, chargers, cables, and device accessories.', 'image' => '/images/categories/electronics-accessories.jpg'],
        'audio-sound' => ['description' => 'Headphones, speakers, and audio equipment.', 'image' => '/images/categories/electronics-audio-sound.jpg'],
        'tvs' => ['description' => 'Smart TVs and home entertainment systems.', 'image' => '/images/categories/electronics-tvs.jpg'],
        'phones-tablets' => ['description' => 'Smartphones, tablets, and mobile devices.', 'image' => '/images/categories/electronics-phones-tablets.jpg'],
        'computers' => ['description' => 'Desktop computers, laptops, and workstations.', 'image' => '/images/categories/electronics-computers.jpg'],
        'audio-video' => ['description' => 'Home theater, headphones, and multimedia equipment.', 'image' => '/images/categories/electronics-audio-video.jpg'],
    ];

    public function up(): void
    {
        $electronics = Category::where('slug', 'electronics')->first();

        if (! $electronics) {
            return;
        }

        $subcategories = [
            'Mobile Phones',
            'Laptops & Computers',
            'Accessories',
            'Audio & Sound',
            'TVs',
            'Phones & Tablets',
            'Computers',
            'Audio & Video',
        ];

        foreach ($subcategories as $index => $name) {
            $slug = 'electronics-' . Str::slug($name);
            $key = Str::slug($name);
            $meta = $this->subcategoryMeta[$key] ?? ['description' => '', 'image' => '/images/categories/default.jpg'];

            Subcategory::firstOrCreate(
                ['slug' => $slug, 'category_id' => $electronics->id],
                [
                    'category_id'  => $electronics->id,
                    'name'         => $name,
                    'slug'         => $slug,
                    'description'  => $meta['description'],
                    'image'        => $meta['image'],
                    'is_active'    => true,
                    'sort_order'   => $index + 1,
                ]
            );
        }
    }

    public function down(): void
    {
        // Non-destructive seed migration.
    }
};
