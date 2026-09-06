<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Product;
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

    public function show(Category $category)
    {
        $categoryIds = $category->selfAndChildrenIds();

        $productsQuery = Product::with(['seller'])
            ->whereIn('category_id', $categoryIds)
            ->latest();

        $products = $productsQuery->paginate(20)->withQueryString();

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category,
            'products' => $products,
        ]);
    }

    /**
     * Simplified add flow: the user either picks an existing parent category
     * from the dropdown (category_id) or types a new parent name (name),
     * and may optionally attach one subcategory to it.
     *
     * - Parent + empty subcategory -> only the main category is ensured
     *   (created with parent_id = null if it did not exist yet).
     * - Parent + subcategory       -> the parent category is reused (its ID,
     *   or created first if it does not exist) and the subcategory is
     *   attached to it with parent_id = $parentCategory->id.
     */
    public function store(Request $request)
    {
        $categoryLabel = trim((string) $request->input('name'));
        $categoryId = $request->filled('category_id') ? (int) $request->input('category_id') : null;

        // Guard checked before validate(): ConvertEmptyStringsToNull turns ''
        // into null (skipping nullable rules) and an empty-string category_id
        // still counts as "present" for required_without — so neither can be
        // relied upon to reject a fully empty submission.
        if ($categoryId === null && $categoryLabel === '') {
            return back()->withErrors([
                'name' => 'Veuillez choisir une catégorie existante ou saisir un nouveau nom.',
            ]);
        }

        $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'subcategory_name' => ['nullable', 'string', 'max:255'],
        ]);

        // Resolve the parent category: reuse the picked one, or find-or-create
        // the one typed freehand (typing an existing name reuses its ID).
        if ($categoryId !== null) {
            $parentCategory = Category::findOrFail($categoryId);
        } else {
            $parentCategory = Category::firstOrCreate(
                ['slug' => Str::slug($categoryLabel)],
                [
                    'name' => $categoryLabel,
                    'parent_id' => null,
                    'is_active' => true,
                ]
            );
        }

        // Attach the optional subcategory to the parent category.
        if ($request->filled('subcategory_name')) {
            $subName = trim((string) $request->input('subcategory_name'));

            $subCategory = Category::firstOrCreate(
                ['slug' => $parentCategory->slug . '-' . Str::slug($subName)],
                [
                    'name' => $subName,
                    'parent_id' => $parentCategory->id,
                    'is_active' => true,
                ]
            );

            Subcategory::updateOrCreate(
                ['slug' => $subCategory->slug],
                [
                    'category_id' => $parentCategory->id,
                    'name' => $subName,
                    'slug' => $subCategory->slug,
                    'is_active' => true,
                ]
            );
        }

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

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

        // Sync subcategories table when a category becomes a subcategory or vice versa
        if ($request->filled('parent_id') && !$category->wasRecentlyCreated) {
            Subcategory::updateOrCreate(
                ['slug' => $category->slug],
                [
                    'category_id' => (int) $request->parent_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'is_active' => $category->is_active,
                ]
            );
        } elseif (!$request->filled('parent_id') && !$category->wasRecentlyCreated) {
            Subcategory::where('slug', $category->slug)->delete();
        }

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0 || $category->children()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete a category with attached products or child categories.']);
        }

        $category->delete();

        Subcategory::where('slug', $category->slug)->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
