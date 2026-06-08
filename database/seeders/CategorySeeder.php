<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics' => ['Mobile Phones', 'Laptops & Computers', 'Accessories', 'Audio & Sound', 'TVs'],
            'Fashion' => ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags & Accessories', 'Jewelry'],
            'Home & Living' => ['Furniture', 'Kitchenware', 'Home Decor', 'Bedding'],
            'Health & Beauty' => ['Makeup', 'Skincare', 'Fragrances', 'Hair Care'],
            'Automotive' => ['Car Parts', 'Motorcycles', 'Vehicle Accessories'],
            'Sports & Outdoors' => ['Fitness Equipment', 'Outdoor Gear', 'Sportswear'],
            'Groceries' => ['Fresh Produce', 'Beverages', 'Snacks', 'Canned Goods'],
        ];

        $sortOrder = 1;
        foreach ($categories as $catName => $subcategories) {
            $category = Category::create([
                'name' => $catName,
                'slug' => Str::slug($catName),
                'is_active' => true,
                'sort_order' => $sortOrder++,
                'meta_title' => "Buy $catName online | PenePene",
                'meta_description' => "Shop for $catName at the best prices on PenePene Marketplace."
            ]);

            $subSortOrder = 1;
            foreach ($subcategories as $subName) {
                Subcategory::create([
                    'category_id' => $category->id,
                    'name' => $subName,
                    'slug' => Str::slug($subName),
                    'is_active' => true,
                    'sort_order' => $subSortOrder++,
                ]);
            }
        }
    }
}
