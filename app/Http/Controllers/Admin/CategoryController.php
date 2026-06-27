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
        $categories = Category::with('subcategories')->get()->map(function ($cat) {
            return [
                'id' => 'cat_' . $cat->id,
                'name' => $cat->name,
                'icon' => $cat->icon,
                'is_active' => $cat->is_active,
                'children' => $cat->subcategories->map(function ($sub) use ($cat) {
                    return [
                        'id' => 'sub_' . $sub->id,
                        'name' => $sub->name,
                        'icon' => $sub->icon,
                        'is_active' => $sub->is_active,
                        'parent_id' => 'cat_' . $cat->id,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        // Get all flat for the parent dropdown
        $allCategories = Category::select('id', 'name')->get()->map(function ($cat) {
            return [
                'id' => 'cat_' . $cat->id,
                'name' => $cat->name,
            ];
        });

        return Inertia::render('Admin/Categories/Index', [
            'categories'    => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|string',
            'icon'      => 'nullable|string|max:255',
        ]);

        if ($request->parent_id && str_starts_with($request->parent_id, 'cat_')) {
            $catId = str_replace('cat_', '', $request->parent_id);
            \App\Models\Subcategory::create([
                'category_id' => $catId,
                'name'      => $request->name,
                'slug'      => Str::slug($request->name),
                'icon'      => $request->icon,
                'is_active' => true,
            ]);
        } else {
            Category::create([
                'name'      => $request->name,
                'slug'      => Str::slug($request->name),
                'icon'      => $request->icon,
                'is_active' => true,
            ]);
        }

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|string',
            'icon'      => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if (str_starts_with($id, 'sub_')) {
            $sub = \App\Models\Subcategory::findOrFail(str_replace('sub_', '', $id));
            $sub->update([
                'name'      => $request->name,
                'category_id' => $request->parent_id ? str_replace('cat_', '', $request->parent_id) : $sub->category_id,
                'icon'      => $request->icon,
                'is_active' => $request->has('is_active') ? $request->is_active : $sub->is_active,
            ]);
        } else {
            $cat = Category::findOrFail(str_replace('cat_', '', $id));
            $cat->update([
                'name'      => $request->name,
                'icon'      => $request->icon,
                'is_active' => $request->has('is_active') ? $request->is_active : $cat->is_active,
            ]);
        }

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy($id)
    {
        if (str_starts_with($id, 'sub_')) {
            $sub = \App\Models\Subcategory::findOrFail(str_replace('sub_', '', $id));
            if ($sub->products()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete subcategory with attached products.']);
            }
            $sub->delete();
        } else {
            $cat = Category::findOrFail(str_replace('cat_', '', $id));
            if ($cat->products()->count() > 0 || $cat->subcategories()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete category with attached products or subcategories.']);
            }
            $cat->delete();
        }

        return back()->with('success', 'Category deleted successfully.');
    }
}
