<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('children')->whereNull('parent_id')->get();
        // Get all flat for the parent dropdown
        $allCategories = Category::all();

        return Inertia::render('Admin/Categories/Index', [
            'categories'    => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'icon'      => 'nullable|string|max:255',
        ]);

        Category::create([
            'name'      => $request->name,
            'slug'      => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'icon'      => $request->icon,
            'is_active' => true,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'icon'      => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name'      => $request->name,
            // 'slug'   => Str::slug($request->name), // Usually we don't update slug to preserve URLs
            'parent_id' => $request->parent_id,
            'icon'      => $request->icon,
            'is_active' => $request->has('is_active') ? $request->is_active : $category->is_active,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Only allow deleting if no products attached or reassign them
        if ($category->products()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with attached products.']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
