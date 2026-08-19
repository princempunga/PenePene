<?php

namespace App\Providers;

use App\Models\Category;
use Illuminate\Support\Facades\Inertia;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('categories', function () {
            return Category::query()
                ->with('children')
                ->whereNull('parent_id')
                ->active()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(function (Category $category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'icon' => $category->icon,
                        'children' => $category->children->map(function (Category $child) {
                            return [
                                'id' => $child->id,
                                'name' => $child->name,
                                'slug' => $child->slug,
                                'icon' => $child->icon,
                            ];
                        })->values()->all(),
                    ];
                })
                ->values()
                ->all();
        });
    }
}
