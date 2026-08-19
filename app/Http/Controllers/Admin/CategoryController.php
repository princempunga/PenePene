<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Category $category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'parent_id' => null,
                    'is_active' => $category->is_active,
                    'children' => $category->children->map(function (Category $child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->name,
                            'slug' => $child->slug,
                            'icon' => $child->icon,
                            'parent_id' => $child->parent_id,
                            'is_active' => $child->is_active,
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        $allCategories = Category::query()
            ->select('id', 'name', 'parent_id')
            ->orderBy('parent_id')
            ->orderBy('name')
            ->get()
            ->map(function (Category $category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'parent_id' => $category->parent_id,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'parent_id' => $request->parent_id ?: null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category = Category::findOrFail($id);

        if ($request->filled('parent_id')) {
            $parentId = (int) $request->parent_id;
            if ($parentId === $category->id) {
                return back()->withErrors(['parent_id' => 'A category cannot be a parent of itself.']);
            }
        }

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'parent_id' => $request->filled('parent_id') ? (int) $request->parent_id : null,
            'is_active' => $request->boolean('is_active', $category->is_active),
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0 || $category->children()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete a category with attached products or child categories.']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
