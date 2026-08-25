<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics' => [
                'Mobile Phones', 'Laptops & Computers', 'Tablets', 'Accessories',
                'Audio & Sound', 'TVs & Home Theater', 'Cameras & Photos',
                'Video Games', 'Smart Watches', 'Networking'
            ],
            'Fashion & Clothing' => [
                'Men\'s Clothing', 'Women\'s Clothing', 'Kids & Baby',
                'Shoes', 'Bags & Handbags', 'Jewelry & Watches',
                'Sunglasses', 'Sports Wear', 'Underwear & Lingerie', 'Traditional Wear'
            ],
            'Home & Furniture' => [
                'Living Room', 'Bedroom', 'Kitchen & Dining',
                'Bathroom', 'Office Furniture', 'Outdoor Furniture',
                'Lighting', 'Home Decor', 'Storage & Organization', 'Rugs & Carpets'
            ],
            'Food & Agriculture' => [
                'Fresh Produce', 'Grains & Cereals', 'Dairy & Eggs',
                'Meat & Poultry', 'Seafood', 'Beverages',
                'Snacks & Sweets', 'Spices & Condiments', 'Organic Products', 'Livestock'
            ],
            'Health & Beauty' => [
                'Skincare', 'Hair Care', 'Makeup',
                'Fragrances', 'Personal Care', 'Vitamins & Supplements',
                'Medical Supplies', 'Fitness & Wellness', 'Baby Care', 'Eye Care'
            ],
            'Education & Books' => [
                'Textbooks', 'Fiction Books', 'Non-Fiction',
                'Children\'s Books', 'Educational Toys', 'Stationery',
                'Art Supplies', 'Musical Instruments', 'Online Courses', 'Office Supplies'
            ],
        ];

        $sortOrder = 1;
        foreach ($categories as $catName => $subcategories) {
            $parentSlug = Str::slug($catName);

            $category = Category::firstOrCreate(
                ['slug' => $parentSlug],
                [
                    'name' => $catName,
                    'slug' => $parentSlug,
                    'image' => '/images/categories/' . $parentSlug . '.jpg',
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                    'parent_id' => null,
                    'meta_title' => $catName . ' | PenePene',
                    'meta_description' => 'Achetez ' . $catName . ' au meilleur prix sur PenePene.',
                ]
            );

            $subSortOrder = 1;
            foreach ($subcategories as $subName) {
                $subSlug = $parentSlug . '-' . Str::slug($subName);

                Category::firstOrCreate(
                    ['slug' => $subSlug],
                    [
                        'name' => $subName,
                        'slug' => $subSlug,
                        'parent_id' => $category->id,
                        'is_active' => true,
                        'sort_order' => $subSortOrder++,
                        'image' => '/images/categories/' . $subSlug . '.jpg',
                    ]
                );
            }

            $sortOrder++;
        }
    }
}
