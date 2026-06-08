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
        $featuredProducts = Product::with(['seller', 'images', 'category'])
            ->active()
            ->featured()
            ->take(8)
            ->get();

        // If no featured, just get some random active products
        if ($featuredProducts->isEmpty()) {
             $featuredProducts = Product::with(['seller', 'images', 'category'])
                ->active()
                ->inRandomOrder()
                ->take(8)
                ->get();
        }

        $popularCategories = Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->active()
            ->orderByDesc('products_count')
            ->take(6)
            ->get();

        $topSellers = Seller::with('user')
            ->active()
            ->orderByDesc('average_rating')
            ->take(4)
            ->get();

        return Inertia::render('Home/Index', [
            'featuredProducts' => $featuredProducts,
            'popularCategories' => $popularCategories,
            'topSellers' => $topSellers,
        ]);
    }
}
