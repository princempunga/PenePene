<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\HomepagePromotion;
use App\Models\Product;
use App\Services\DemoProductService;
use App\Services\ProductPromotionService;

class HomeController extends Controller
{
    public function index(ProductPromotionService $promotionService)
    {
        $baseProductQuery = Product::with(['seller', 'images', 'category'])->active();

        $popularCategories = Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->active()
            ->orderByDesc('products_count')
            ->take(12)
            ->get();

        $heroProducts = (clone $baseProductQuery)
            ->latest()
            ->take(2)
            ->get()
            ->each(fn (Product $product) => $product->setAttribute(
                'image_url',
                DemoProductService::productImageUrl($product),
            ));

        if ($heroProducts->isEmpty()) {
            $heroProducts = collect(DemoProductService::heroProducts(2));
        } elseif ($heroProducts->count() < 2) {
            $heroProducts = $heroProducts->concat(
                DemoProductService::heroProducts(2 - $heroProducts->count()),
            );
        }

        // 4 carrousels × 10 produits (mise en avant par priorité sous-catégorie)
        $productSliders = $promotionService->homepageSliders();

        $featuredPromotions = HomepagePromotion::active()
            ->with([
                'seller.user',
                'product.images',
                'product.category',
            ])
            ->orderBy('promotion_order')
            ->take(10)
            ->get()
            ->map(function ($promo) {
                $product = $promo->product;
                $seller  = $promo->seller;
                $image   = $product?->images?->where('is_primary', true)->first()
                        ?? $product?->images?->first();

                return [
                    'id'               => $promo->id,
                    'promotion_order'  => $promo->promotion_order,
                    'product_id'       => $product?->id,
                    'product_name'     => $product?->name,
                    'product_price'    => $product?->sale_price ?? $product?->price,
                    'product_currency' => $product?->currency ?? 'CDF',
                    'product_slug'     => $product?->slug,
                    'custom_image_url' => $promo->custom_image_url,
                    'headline'         => $promo->headline,
                    'product_image'    => $image ? (
                        str_starts_with($image->image_path, 'images/')
                            ? '/' . $image->image_path
                            : '/storage/' . $image->image_path
                    ) : null,
                    'category_name'    => $product?->category?->name,
                    'seller_id'        => $seller?->id,
                    'seller_name'      => $seller?->business_name,
                    'seller_slug'      => $seller?->slug,
                    'seller_city'      => $seller?->city,
                    'seller_rating'    => $seller?->average_rating,
                    'seller_verified'  => $seller?->is_verified,
                ];
            });

        if ($featuredPromotions->isEmpty()) {
            $fallback = (clone $baseProductQuery)->latest()->take(10)->get();
            $featuredPromotions = $fallback->map(function ($product) use ($fallback) {
                $seller = $product->seller;
                $image  = $product->images?->where('is_primary', true)->first()
                       ?? $product->images?->first();
                return [
                    'id'               => null,
                    'promotion_order'  => $fallback->search($product) + 1,
                    'product_id'       => $product->id,
                    'product_name'     => $product->name,
                    'product_price'    => $product->sale_price ?? $product->price,
                    'product_currency' => $product->currency ?? 'CDF',
                    'product_slug'     => $product->slug,
                    'product_image'    => $image ? (
                        str_starts_with($image->image_path, 'images/')
                            ? '/' . $image->image_path
                            : '/storage/' . $image->image_path
                    ) : null,
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
}
