<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    use SimulatesData;

    public function index()
    {
        $categories    = Category::with('children')->whereNull('parent_id')->get();
        $allCategories = Category::all();

        $usingDemo = $this->adminDemoEnabled() && $categories->isEmpty();

        if ($usingDemo) {
            $categories    = AdminDemoDataService::categories();
            $allCategories = AdminDemoDataService::flatCategories();
        }

        return Inertia::render('Admin/Categories/Index', [
            'categories'    => $categories,
            'allCategories' => $allCategories,
            'usingDemoData' => $usingDemo,
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
            'parent_id' => $request->parent_id,
            'icon'      => $request->icon,
            'is_active' => $request->has('is_active') ? $request->is_active : $category->is_active,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with attached products.']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
