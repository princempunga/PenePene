<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('subcategories')
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->active()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function show(Category $category)
    {
        $category->load('subcategories');
        
        $products = $category->products()
            ->with(['seller', 'images'])
            ->active()
            ->latest()
            ->paginate(12);

        return Inertia::render('Categories/Show', [
            'category' => $category,
            'products' => $products,
        ]);
    }
}
