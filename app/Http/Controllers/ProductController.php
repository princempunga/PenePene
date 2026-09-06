<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Favorite;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;
use App\Support\ProductListing;
use App\Support\CatalogTranslations;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['seller', 'images', 'category', 'subcategory'])->active();

        $category = null;
        $subcategory = null;

        $childCategory = null;

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)->first();

            // A category with published subcategories rolls up their products too,
            // so browsing "Electronics" also shows items filed under "Smartphones".
            if ($category) {
                $categoryIds = $category->selfAndChildrenIds();
                $query->whereIn('category_id', $categoryIds);
            }
        }

        if ($request->filled('subcategory')) {
            // Prefer the real category hierarchy (subcategories are Category rows
            // with a parent_id) before falling back to the legacy demo catalog.
            if ($category) {
                $requestedSlug = $request->subcategory;
                $childCategory = $category->children()
                    ->where(function ($q) use ($category, $requestedSlug) {
                        $q->where('slug', $requestedSlug)
                          ->orWhere('slug', $category->slug . '-' . $requestedSlug);
                    })
                    ->first();
            }

            if ($childCategory) {
                $query->where('category_id', $childCategory->id);
            }
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->filled('city')) {
            $query->where(function ($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%')
                    ->orWhereHas('seller', fn ($s) => $s->where('city', 'like', '%' . $request->city . '%'));
            });
        }

        if ($request->filled('brand')) {
            $query->where('name', 'like', '%' . $request->brand . '%');
        }

        if ($request->filled('condition')) {
            // Reserved for when condition column exists; no-op for now on real products.
        }

        if ($request->boolean('verified_seller')) {
            $query->whereHas('seller', fn ($q) => $q->verified());
        }

        if ($request->get('filter') === 'sale') {
            $query->whereNotNull('sale_price');
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popularity':
            case 'popular':
                $query->orderByDesc('view_count');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $products = ProductListing::paginateOrDemo(
            $query,
            $category,
            $subcategory,
            $request->subcategory
        );

        if ($category) {
            $category->name = CatalogTranslations::categoryName($category->slug, $category->name);
        }

        $brands = [];

        $pageMeta = null;
        if ($request->get('filter') === 'sale') {
            $pageMeta = [
                'title'       => 'Flash Deals',
                'description' => 'Limited-time offers and hot deals from verified sellers. Save big on top products today.',
                'image'       => '/images/categories/electronics.jpg',
            ];
        }

        return Inertia::render('Products/Index', [
            'products'        => $products,
            'filters'         => $request->only([
                'category', 'subcategory', 'sort', 'min_price', 'max_price',
                'city', 'brand', 'condition', 'verified_seller', 'filter',
            ]),
            'category'        => $category,
            'subcategory'     => $subcategory,
            'pageMeta'        => $pageMeta,
            'brandOptions'    => $brands,
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        if ($product->status !== 'active') {
            abort(404);
        }

        $product->load(['seller.user', 'images', 'category', 'subcategory']);
        $product->increment('view_count');

        $relatedProducts = Product::with(['seller', 'images'])
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        $reviews = $product->reviews()
            ->with('buyer.user')
            ->approved()
            ->latest()
            ->take(5)
            ->get();

        $productArray = $product->toArray();
        if ($product->category) {
            $productArray['category']['name'] = CatalogTranslations::categoryName(
                $product->category->slug,
                $product->category->name
            );
        }
        $productArray['seller'] = array_merge(
            $product->seller->toArray(),
            ['user' => $product->seller->user?->only(['id', 'name', 'avatar', 'is_online', 'last_seen_at'])]
        );

        return Inertia::render('Products/Show', [
            'product'           => $productArray,
            'relatedProducts'   => $relatedProducts,
            'reviews'           => $reviews,
            'favoriteProductId' => $product->id,
            'isFavorited'       => $this->isFavorited($product->id),
        ]);
    }

    private function isFavorited(int $productId): bool
    {
        $user = auth()->user();

        if (! $user?->buyer) {
            return false;
        }

        return Favorite::where('buyer_id', $user->buyer->id)
            ->where('product_id', $productId)
            ->exists();
    }
}
