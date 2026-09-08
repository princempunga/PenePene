<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Support\ProductListing;
use App\Support\CatalogTranslations;
use Illuminate\Support\Str;


class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->with('children')
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->whereNull('parent_id')
            ->active()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function show(Category $category)
    {
        $category->description = CatalogTranslations::categoryDescription(
            $category->slug,
            $category->description
        );
        $category->name = CatalogTranslations::categoryName($category->slug, $category->name);

        $category->load(['children' => fn ($q) => $q->active()->orderBy('sort_order')]);

        // Products filed directly under a subcategory still belong to this
        // category page, so roll them up alongside the category's own products.
        $categoryIds = $category->selfAndChildrenIds();

        $query = Product::with(['seller', 'images', 'category'])
            ->whereIn('category_id', $categoryIds)
            ->active();

        $products = ProductListing::paginateOrDemo($query, $category);

        $featuredQuery = Product::with(['seller', 'images', 'category'])
            ->whereIn('category_id', $categoryIds)
            ->active()
            ->latest()
            ->take(8)
            ->get();

        $featuredProducts = $featuredQuery;

        $categoryImage = $category->image;

        $subcategoryCards = $category->children
            ->unique(fn ($sub) => Str::slug($sub->slug))
            ->values()
            ->map(function ($sub) use ($category, $categoryImage) {
                $shortSlug = Str::slug($sub->slug);

                return CatalogTranslations::localizeSubcategoryCard([
                    'id'          => $sub->id,
                    'name'        => $sub->name,
                    'slug'        => $sub->slug,
                    'description' => $sub->description ?? '',
                    'image'       => $sub->image ?? $categoryImage,
                    'short_slug'  => $shortSlug,
                ], $category->slug);
            })
            ->values()
            ->all();

        $category->unsetRelation('children');

        return Inertia::render('Categories/Show', [
            'category'          => $category,
            'products'          => $products,
            'featuredProducts'  => $featuredProducts,
            'subcategoryCards'  => $subcategoryCards,
            'popularBrands'     => [],
        ]);
    }
}
