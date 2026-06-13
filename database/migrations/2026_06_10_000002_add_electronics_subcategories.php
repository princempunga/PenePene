<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Category;
use App\Models\Subcategory;
use App\Services\DemoProductService;
use Illuminate\Support\Str;

return new class extends Migration
{
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
            $key = DemoProductService::normalizeSubcategorySlug($slug, 'electronics');
            $meta = DemoProductService::subcategoryMeta(null, $key, 'electronics');

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
