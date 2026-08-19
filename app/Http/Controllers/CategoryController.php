<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Support\ProductListing;
use App\Support\CatalogTranslations;
use App\Services\DemoProductService;

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
            DemoProductService::categoryDescription($category)
        );
        $category->image = DemoProductService::categoryImage($category);
        $category->name = CatalogTranslations::categoryName($category->slug, $category->name);

        $category->load(['children' => fn ($q) => $q->active()->orderBy('sort_order')]);

        $query = Product::with(['seller', 'images', 'category'])
            ->where('category_id', $category->id)
            ->active();

        $listing = ProductListing::paginateOrDemo($query, $category);

        if ($listing['using_demo']) {
            $listing['products'] = CatalogTranslations::localizePaginator($listing['products']);
        }

        $featuredQuery = Product::with(['seller', 'images', 'category'])
            ->where('category_id', $category->id)
            ->active()
            ->latest()
            ->take(8)
            ->get();

        $featuredProducts = $featuredQuery->isNotEmpty()
            ? $featuredQuery
            : CatalogTranslations::localizeProducts(DemoProductService::featuredForCategory($category));

        $categoryImage = DemoProductService::categoryImage($category);

        $subcategoryCards = $category->children
            ->unique(fn ($sub) => DemoProductService::normalizeSubcategorySlug($sub->slug, $category->slug))
            ->values()
            ->map(function ($sub) use ($category, $categoryImage) {
                $shortSlug = DemoProductService::normalizeSubcategorySlug($sub->slug, $category->slug);
                $meta = DemoProductService::subcategoryMeta($sub, $shortSlug, $category->slug);

                return CatalogTranslations::localizeSubcategoryCard([
                    'id'          => $sub->id,
                    'name'        => $sub->name,
                    'slug'        => $sub->slug,
                    'description' => $meta['description'],
                    'image'       => $sub->image ?? $meta['image'] ?? $categoryImage,
                    'short_slug'  => $shortSlug,
                ], $category->slug);
            })
            ->values()
            ->all();

        $category->unsetRelation('children');

        return Inertia::render('Categories/Show', [
            'category'          => $category,
            'products'          => $listing['products'],
            'usingDemo'         => $listing['using_demo'],
            'featuredProducts'  => $featuredProducts,
            'subcategoryCards'  => $subcategoryCards,
            'popularBrands'     => $category->slug === 'electronics'
                ? DemoProductService::popularBrands()
                : [],
        ]);
    }
}
