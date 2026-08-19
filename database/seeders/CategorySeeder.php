<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics'       => ['Mobile Phones', 'Laptops & Computers', 'Accessories', 'Audio & Sound', 'TVs'],
            'Fashion'           => ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags & Accessories', 'Jewelry'],
            'Home & Living'     => ['Furniture', 'Kitchenware', 'Home Decor', 'Bedding'],
            'Health & Beauty'   => ['Makeup', 'Skincare', 'Fragrances', 'Hair Care'],
            'Automotive'        => ['Car Parts', 'Motorcycles', 'Vehicle Accessories'],
            'Sports & Outdoors' => ['Fitness Equipment', 'Outdoor Gear', 'Sportswear'],
            'Groceries'         => ['Fresh Produce', 'Beverages', 'Snacks', 'Canned Goods'],
            'Home & Garden'     => ['Furniture', 'Kitchen', 'Garden', 'Decor'],
            'Food & Drinks'     => ['Fresh Produce', 'Beverages', 'Snacks', 'Grains & Cereals'],
            'Vehicles'          => ['Cars', 'Motorcycles', 'Spare Parts', 'Trucks'],
            'Real Estate'       => ['Houses for Sale', 'Houses for Rent', 'Land', 'Commercial Property'],
            'Services'          => ['Cleaning', 'Repairs', 'Tutoring', 'Events & Catering'],
        ];

        $sortOrder = 1;
        foreach ($categories as $catName => $subcategories) {
            $parentSlug = Str::slug($catName);

            $category = Category::firstOrCreate(
                ['slug' => $parentSlug],
                [
                    'name'             => $catName,
                    'slug'             => $parentSlug,
                    'image'            => "/images/categories/{$parentSlug}.jpg",
                    'is_active'        => true,
                    'sort_order'       => $sortOrder,
                    'parent_id'        => null,
                    'meta_title'       => "Buy {$catName} online | PenePene",
                    'meta_description' => "Shop for {$catName} at the best prices on PenePene Marketplace.",
                ]
            );

            $subSortOrder = 1;
            foreach ($subcategories as $subName) {
                $subSlug = $parentSlug . '-' . Str::slug($subName);

                Category::firstOrCreate(
                    ['slug' => $subSlug],
                    [
                        'name'        => $subName,
                        'slug'        => $subSlug,
                        'parent_id'   => $category->id,
                        'is_active'   => true,
                        'sort_order'  => $subSortOrder++,
                        'image'       => "/images/categories/{$subSlug}.jpg",
                    ]
                );
            }

            $sortOrder++;
        }
    }
}
