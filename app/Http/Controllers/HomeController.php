<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;

class HomeController extends Controller
{
    public function index()
    {
        $baseProductQuery = Product::with(['seller', 'images', 'category'])->active();

        $featuredProducts = (clone $baseProductQuery)
            ->featured()
            ->take(8)
            ->get();

        if ($featuredProducts->isEmpty()) {
             $featuredProducts = (clone $baseProductQuery)->inRandomOrder()->take(8)->get();
        }

        $popularCategories = Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->active()
            ->orderByDesc('products_count')
            ->take(12)
            ->get();

        $topSellers = Seller::with('user')
            ->active()
            ->orderByDesc('average_rating')
            ->take(8)
            ->get();

        // New Collections for the Homepage Redesign
        // If specific scopes don't exist yet, we simulate them so the frontend has structural data

        $sponsoredProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate sponsored
            ->take(6)
            ->get();

        $nearbyProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate nearby
            ->take(6)
            ->get();

        $trendingProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate trending
            ->take(10)
            ->get();

        $flashDeals = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate deals
            ->take(6)
            ->get();

        return Inertia::render('Home/Index', [
            'featuredProducts' => $featuredProducts,
            'popularCategories' => $popularCategories,
            'topSellers' => $topSellers,
            'sponsoredProducts' => $sponsoredProducts,
            'nearbyProducts' => $nearbyProducts,
            'trendingProducts' => $trendingProducts,
            'flashDeals' => $flashDeals,
        ]);
    }
}
