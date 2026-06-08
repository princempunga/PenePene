<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $keyword = $request->input('q');
        
        $query = Product::with(['seller', 'images', 'category'])->active();

        if ($keyword) {
            $query->search($keyword);
        }

        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $products = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::active()->get();

        return Inertia::render('Search/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['q', 'category']),
        ]);
    }
}
