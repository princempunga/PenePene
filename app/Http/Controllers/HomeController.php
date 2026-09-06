<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\HomepagePromotion;
use App\Models\Product;

use App\Services\ProductPromotionService;

class HomeController extends Controller
{
    public function index(ProductPromotionService $promotionService)
    {
        $baseProductQuery = Product::with(['seller', 'images', 'category'])->active();

        $popularCategories = Category::with('children')
            ->whereNull('parent_id')
            ->active()
            ->get()
            ->each(fn (Category $category) => $category->setAttribute(
                'products_count',
                $category->active_product_count,
            ))
            ->sortByDesc('products_count')
            ->take(12)
            ->values();

        $heroProducts = (clone $baseProductQuery)
            ->latest()
            ->take(2)
            ->get()
            ->each(fn (Product $product) => $product->setAttribute(
                'image_url',
                $this->productImageUrl($product),
            ));

        // 4 carrousels × 10 produits (mise en avant par priorité sous-catégorie)
        $productSliders = $promotionService->homepageSliders();

        $featuredPromotions = HomepagePromotion::active()
            ->with([
                'seller.user',
                'product.images',
                'product.category',
            ])
            ->orderBy('promotion_order')
            ->take(4)
            ->get()
            ->map(function ($promo) {
                $seller = $promo->seller;
                $selectedProductIds = $promo->product_ids ?: ($promo->product_id ? [$promo->product_id] : []);

                $selectedProducts = $selectedProductIds
                    ? Product::whereIn('id', $selectedProductIds)
                        ->with(['images', 'category'])
                        ->get()
                        ->map(function ($product) {
                            return [
                                'id'            => $product->id,
                                'name'          => $product->name,
                                'slug'          => $product->slug,
                                'price'         => $product->sale_price ?? $product->price,
                                'currency'      => $product->currency ?? 'CDF',
                                'category_name' => $product->category?->name,
                                'image_url'     => $this->productImageUrl($product),
                            ];
                        })
                    : collect([]);

                $primaryProduct = $selectedProducts->first() ?? $promo->product;

                $productImage = ($selectedProducts->first() ?: [])['image_url'] ?? null;
                if (!$productImage && $promo->product) {
                    $productImage = $this->productImageUrl($promo->product);
                }

                $customImage = $promo->custom_image_url
                    ? $this->normalizeHeroImageUrl($promo->custom_image_url)
                    : null;

                $primaryProductId = is_array($primaryProduct) ? ($primaryProduct['id'] ?? null) : ($primaryProduct?->id ?? null);
                $primaryProductName = is_array($primaryProduct) ? ($primaryProduct['name'] ?? null) : ($primaryProduct?->name ?? null);
                $primaryProductPrice = is_array($primaryProduct)
                    ? ($primaryProduct['price'] ?? null)
                    : ($primaryProduct?->sale_price ?? $primaryProduct?->price ?? null);
                $primaryProductCurrency = is_array($primaryProduct)
                    ? ($primaryProduct['currency'] ?? 'CDF')
                    : ($primaryProduct?->currency ?? 'CDF');
                $primaryProductSlug = is_array($primaryProduct) ? ($primaryProduct['slug'] ?? null) : ($primaryProduct?->slug ?? null);
                $primaryProductCategory = is_array($primaryProduct)
                    ? ($primaryProduct['category_name'] ?? null)
                    : ($primaryProduct?->category?->name ?? null);

                return [
                    'id'               => $promo->id,
                    'promotion_order'  => $promo->promotion_order,
                    'product_id'       => $primaryProductId,
                    'product_name'     => $primaryProductName,
                    'product_price'    => $primaryProductPrice,
                    'product_currency' => $primaryProductCurrency,
                    'product_slug'     => $primaryProductSlug,
                    'custom_image_url' => $customImage,
                    'headline'         => $promo->headline,
                    'product_image'    => $productImage,
                    'category_name'    => $primaryProductCategory,
                    'seller_id'        => $seller?->id,
                    'seller_name'      => $seller?->business_name,
                    'seller_slug'      => $seller?->slug,
                    'seller_city'      => $seller?->city,
                    'seller_rating'    => $seller?->average_rating,
                    'seller_verified'  => $seller?->is_verified,
                    'product_ids'      => $selectedProductIds,
                    'products'         => $selectedProducts,
                ];
            })
            ->values();

        if ($featuredPromotions->isEmpty()) {
            $fallback = (clone $baseProductQuery)->latest()->take(4)->get();
            $featuredPromotions = $fallback->map(function ($product) use ($fallback) {
                $seller = $product->seller;
                return [
                    'id'               => null,
                    'promotion_order'  => $fallback->search($product) + 1,
                    'product_id'       => $product->id,
                    'product_name'     => $product->name,
                    'product_price'    => $product->sale_price ?? $product->price,
                    'product_currency' => $product->currency ?? 'CDF',
                    'product_slug'     => $product->slug,
                    'product_image'    => $this->productImageUrl($product),
                    'category_name'    => $product->category?->name,
                    'seller_id'        => $seller?->id,
                    'seller_name'      => $seller?->business_name,
                    'seller_slug'      => $seller?->slug,
                    'seller_city'      => $seller?->city,
                    'seller_rating'    => $seller?->average_rating,
                    'seller_verified'  => $seller?->is_verified,
                ];
            });
        }

        return Inertia::render('Home/Index', [
            'heroProducts'       => $heroProducts,
            'popularCategories'  => $popularCategories,
            'productSliders'     => $productSliders,
            'featuredPromotions' => $featuredPromotions,
        ]);
    }

    private function normalizeHeroImageUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        if (str_starts_with($path, 'images/')) {
            return '/' . $path;
        }

        return '/storage/' . ltrim($path, '/');
    }

    private function productImageUrl(?Product $product): ?string
    {
        if (!$product) {
            return null;
        }

        $image = $product->images?->where('is_primary', true)->first()
              ?? $product->images?->first();

        if (!$image?->image_path) {
            return null;
        }

        return $this->normalizeHeroImageUrl($image->image_path);
    }
}
