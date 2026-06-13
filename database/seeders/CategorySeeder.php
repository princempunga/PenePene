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
            $slug = Str::slug($catName);

            $category = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name'             => $catName,
                    'slug'             => $slug,
                    'image'            => "/images/categories/{$slug}.jpg",
                    'is_active'        => true,
                    'sort_order'       => $sortOrder,
                    'meta_title'       => "Buy {$catName} online | PenePene",
                    'meta_description' => "Shop for {$catName} at the best prices on PenePene Marketplace.",
                ]
            );

            if (empty($category->image)) {
                $category->update(['image' => "/images/categories/{$slug}.jpg"]);
            }

            $subSortOrder = 1;
            foreach ($subcategories as $subName) {
                Subcategory::firstOrCreate(
                    ['slug' => $slug . '-' . Str::slug($subName), 'category_id' => $category->id],
                    [
                        'category_id' => $category->id,
                        'name'        => $subName,
                        'slug'        => $slug . '-' . Str::slug($subName),
                        'is_active'   => true,
                        'sort_order'  => $subSortOrder++,
                    ]
                );
            }

            $sortOrder++;
        }
    }
}
