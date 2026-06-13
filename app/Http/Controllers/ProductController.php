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
use App\Services\DemoProductService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['seller', 'images', 'category', 'subcategory'])->active();

        $category = null;
        $subcategory = null;

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)->first();

            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('subcategory')) {
            $subcategory = DemoProductService::resolveSubcategory(
                $request->subcategory,
                $request->category
            );

            if ($subcategory) {
                $query->where('subcategory_id', $subcategory->id);
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

        $listing = ProductListing::paginateOrDemo(
            $query,
            $category,
            $subcategory,
            $request->subcategory
        );

        if ($listing['using_demo']) {
            $listing['products'] = CatalogTranslations::localizePaginator($listing['products']);
        }

        if ($category) {
            $category->name = CatalogTranslations::categoryName($category->slug, $category->name);
        }

        $subcategoryMeta = ($subcategory || $request->filled('subcategory'))
            ? DemoProductService::subcategoryMeta($subcategory, $request->subcategory, $category?->slug ?? 'electronics')
            : null;

        if ($subcategoryMeta) {
            $subcategoryMeta = CatalogTranslations::localizeSubcategoryMeta(
                $subcategoryMeta,
                $category?->slug ?? 'electronics'
            );
        }

        $brands = $category?->slug === 'electronics'
            ? collect(DemoProductService::popularBrands())->pluck('name')->values()->all()
            : [];

        $pageMeta = null;
        if ($request->get('filter') === 'sale') {
            $pageMeta = [
                'title'       => 'Flash Deals',
                'description' => 'Limited-time offers and hot deals from verified sellers. Save big on top products today.',
                'image'       => '/images/categories/electronics.jpg',
            ];
        }

        return Inertia::render('Products/Index', [
            'products'        => $listing['products'],
            'usingDemo'       => $listing['using_demo'],
            'filters'         => $request->only([
                'category', 'subcategory', 'sort', 'min_price', 'max_price',
                'city', 'brand', 'condition', 'verified_seller', 'filter',
            ]),
            'category'        => $category,
            'subcategory'     => $subcategory,
            'subcategoryMeta' => $subcategoryMeta,
            'pageMeta'        => $pageMeta,
            'brandOptions'    => $brands,
        ]);
    }

    public function show(string $slug)
    {
        if (str_starts_with($slug, 'demo-')) {
            $demo = DemoProductService::findBySlug($slug);

            if (! $demo) {
                abort(404);
            }

            $dbProduct = DemoProductService::ensureDatabaseProduct($demo);
            $productData = DemoProductService::prepareForShow($demo);
            $productData = $this->attachSellerForChat($productData, $dbProduct->seller_id);
            $productData = CatalogTranslations::localizeProduct($productData);
            $related = CatalogTranslations::localizeProducts(DemoProductService::relatedForDemo($demo));

            return Inertia::render('Products/Show', [
                'product'           => $productData,
                'relatedProducts'   => $related,
                'usingDemo'         => true,
                'favoriteProductId' => $dbProduct->id,
                'isFavorited'       => $this->isFavorited($dbProduct->id),
            ]);
        }

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
            'usingDemo'         => false,
            'favoriteProductId' => $product->id,
            'isFavorited'       => $this->isFavorited($product->id),
        ]);
    }

    private function attachSellerForChat(array $productData, int $sellerId): array
    {
        $seller = Seller::with('user')->find($sellerId);

        if ($seller) {
            $productData['seller'] = array_merge($productData['seller'] ?? [], [
                'id'             => $seller->id,
                'slug'           => $seller->slug ?? ($productData['seller']['slug'] ?? 'demo-seller'),
                'business_name'  => $seller->business_name,
                'phone'          => $seller->phone ?? ($productData['seller']['phone'] ?? '+243812345678'),
                'logo'           => $seller->logo,
                'average_rating' => $seller->average_rating ?? ($productData['seller']['average_rating'] ?? 4.7),
                'city'           => $seller->city ?? ($productData['seller']['city'] ?? 'Kinshasa'),
                'user'           => $seller->user?->only(['id', 'name', 'avatar', 'is_online', 'last_seen_at']),
            ]);
        }

        return $productData;
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
