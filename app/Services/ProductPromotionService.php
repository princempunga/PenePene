<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * Mise en avant par sous-catégorie : les 20 premiers produits (priority_position) servent de produits sponsorisés.
 */
class ProductPromotionService
{
    public const PROMOTED_PER_SUBCATEGORY = 20;

    public const HOMEPAGE_SLIDER_COUNT = 4;

    public const PRODUCTS_PER_SLIDER = 10;

    /**
     * Retourne 4 tableaux de 10 produits pour les carrousels de la page d'accueil.
     */
    public function homepageSliders(): array
    {
        $products = $this->promotedProducts(self::HOMEPAGE_SLIDER_COUNT * self::PRODUCTS_PER_SLIDER);

        if ($products->count() < self::HOMEPAGE_SLIDER_COUNT * self::PRODUCTS_PER_SLIDER) {
            $existingIds = $products->pluck('id');
            $fallback = Product::with(['seller', 'images', 'category', 'subcategory'])
                ->active()
                ->whereNotIn('id', $existingIds)
                ->latest()
                ->take(self::HOMEPAGE_SLIDER_COUNT * self::PRODUCTS_PER_SLIDER - $products->count())
                ->get();

            $products = $products->concat($fallback);
        }

        return $products
            ->chunk(self::PRODUCTS_PER_SLIDER)
            ->take(self::HOMEPAGE_SLIDER_COUNT)
            ->map(fn (Collection $chunk) => $chunk->values())
            ->values()
            ->all();
    }

    /**
     * Produits mis en avant : top 20 par sous-catégorie selon priority_position.
     */
    public function promotedProducts(int $limit = 40): Collection
    {
        $subcategoryIds = Product::active()
            ->whereNotNull('subcategory_id')
            ->distinct()
            ->pluck('subcategory_id');

        $promoted = collect();

        foreach ($subcategoryIds as $subcategoryId) {
            $items = Product::with(['seller', 'images', 'category', 'subcategory'])
                ->active()
                ->where('subcategory_id', $subcategoryId)
                ->where(function ($q) {
                    $q->where('promotion_status', 'active')
                      ->where(function ($q2) {
                          $q2->whereNull('sponsored_until')
                             ->orWhere('sponsored_until', '>', now());
                      });
                })
                ->orderByRaw('priority_position IS NULL, priority_position ASC')
                ->orderByDesc('created_at')
                ->take(self::PROMOTED_PER_SUBCATEGORY)
                ->get();

            $promoted = $promoted->concat($items);
        }

        return $promoted
            ->sortBy(fn (Product $p) => [$p->priority_position ?? 9999, $p->created_at])
            ->take($limit)
            ->values();
    }
}
