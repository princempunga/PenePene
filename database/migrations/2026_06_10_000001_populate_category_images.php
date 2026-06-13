<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Category;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('categories', 'image')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('image')->nullable()->after('icon');
            });
        }

        $slugToImage = [
            'electronics'      => '/images/categories/electronics.jpg',
            'fashion'          => '/images/categories/fashion.jpg',
            'home-living'      => '/images/categories/home-living.jpg',
            'health-beauty'    => '/images/categories/health-beauty.jpg',
            'automotive'       => '/images/categories/automotive.jpg',
            'sports-outdoors'  => '/images/categories/sports-outdoors.jpg',
            'groceries'        => '/images/categories/groceries.jpg',
            'home-garden'      => '/images/categories/home-garden.jpg',
            'food-drinks'      => '/images/categories/food-drinks.jpg',
            'vehicles'         => '/images/categories/vehicles.jpg',
            'real-estate'      => '/images/categories/real-estate.jpg',
            'services'         => '/images/categories/services.jpg',
        ];

        foreach ($slugToImage as $slug => $imagePath) {
            Category::where('slug', $slug)
                ->whereNull('image')
                ->update(['image' => $imagePath]);
        }
    }

    public function down(): void
    {
        // No rollback needed — image column may pre-exist and data is non-destructive.
    }
};
