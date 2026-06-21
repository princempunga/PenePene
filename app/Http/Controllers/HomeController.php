<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;
use App\Models\HomepagePromotion;
use App\Services\DemoProductService;

class HomeController extends Controller
{
    public function index()
    {
        $baseProductQuery = Product::with(['seller', 'images', 'category'])->active();

        $featuredProducts = (clone $baseProductQuery)
            ->featured()
            ->take(8)
            ->get();

        if ($featuredProducts->isEmpty()) {
             $featuredProducts = (clone $baseProductQuery)->inRandomOrder()->take(8)->get();
        }

        $popularCategories = Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->active()
            ->orderByDesc('products_count')
            ->take(12)
            ->get();

        $topSellers = Seller::with('user')
            ->active()
            ->orderByDesc('average_rating')
            ->take(8)
            ->get();

        $heroProducts = (clone $baseProductQuery)
            ->featured()
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

        // New Collections for the Homepage Redesign
        // If specific scopes don't exist yet, we simulate them so the frontend has structural data

        $sponsoredProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate sponsored
            ->take(6)
            ->get();

        $nearbyProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate nearby
            ->take(6)
            ->get();

        $trendingProducts = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate trending
            ->take(10)
            ->get();

        $flashDeals = (clone $baseProductQuery)
            ->inRandomOrder() // Simulate deals
            ->take(6)
            ->get();

        // ── Featured Promotions (admin-managed) ──────────────────────────────
        $featuredPromotions = HomepagePromotion::active()
            ->with([
                'seller.user',
                'product.images',
                'product.category',
            ])
            ->orderBy('promotion_order')
            ->take(3)
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

        // Fallback: if no active promotions, use random featured products as cards
        if ($featuredPromotions->isEmpty()) {
            $fallback = (clone $baseProductQuery)->inRandomOrder()->take(3)->get();
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
            'featuredProducts'   => $featuredProducts,
            'popularCategories'  => $popularCategories,
            'topSellers'         => $topSellers,
            'sponsoredProducts'  => $sponsoredProducts,
            'nearbyProducts'     => $nearbyProducts,
            'trendingProducts'   => $trendingProducts,
            'flashDeals'         => $flashDeals,
            'featuredPromotions' => $featuredPromotions,
        ]);
    }
}
