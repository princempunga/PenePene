<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubcategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::whereNotNull('parent_id')->get();

        foreach ($categories as $category) {
            $parent = $category->parent;

            if (!$parent) {
                continue;
            }

            Subcategory::updateOrCreate(
                ['slug' => $category->slug],
                [
                    'category_id'    => $parent->id,
                    'name'           => $category->name,
                    'slug'           => $category->slug,
                    'icon'           => $category->icon,
                    'image'          => $category->image,
                    'description'    => $category->description,
                    'meta_title'     => $category->meta_title,
                    'meta_description' => $category->meta_description,
                    'is_active'      => $category->is_active ?? true,
                    'sort_order'     => $category->sort_order ?? 0,
                ]
            );
        }
    }
}
