<?php

namespace App\Support;

use App\Services\DemoProductService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Str;

class CatalogTranslations
{
    public static function categoryName(string $slug, ?string $fallback = null): string
    {
        return self::resolve("categories.{$slug}.name", $fallback ?? $slug);
    }

    public static function categoryDescription(string $slug, ?string $fallback = null): string
    {
        return self::resolve("categories.{$slug}.description", $fallback ?? '');
    }

    public static function subcategoryName(string $shortSlug, ?string $fallback = null): string
    {
        return self::resolve("subcategories.{$shortSlug}.name", $fallback ?? $shortSlug);
    }

    public static function subcategoryDescription(string $shortSlug, ?string $fallback = null): string
    {
        return self::resolve("subcategories.{$shortSlug}.description", $fallback ?? '');
    }

    public static function demoProductName(string $slug, ?string $fallback = null): string
    {
        $key = self::normalizeDemoSlug($slug);

        return self::resolve("demo_products.{$key}.name", $fallback ?? $slug);
    }

    public static function demoProductDescription(string $slug, ?string $fallback = null): string
    {
        $key = self::normalizeDemoSlug($slug);

        return self::resolve("demo_products.{$key}.description", $fallback ?? '');
    }

    public static function localizeCategory(object|array $category): array
    {
        $data = is_array($category) ? $category : $category->toArray();
        $slug = $data['slug'] ?? '';

        if ($slug !== '') {
            $data['name'] = self::categoryName($slug, $data['name'] ?? $slug);
            $data['description'] = self::categoryDescription($slug, $data['description'] ?? '');
        }

        return $data;
    }

    public static function localizeProduct(array $product): array
    {
        $slug = $product['slug'] ?? '';
        $isDemo = ! empty($product['is_demo']) || str_starts_with($slug, 'demo-');

        if ($isDemo && $slug !== '') {
            $demoKey = self::normalizeDemoSlug($slug);
            $product['name'] = self::demoProductName($demoKey, $product['name'] ?? $slug);

            $description = $product['description'] ?? null;
            $translatedDescription = self::demoProductDescription($demoKey, $description);

            if ($translatedDescription !== '') {
                $product['description'] = $translatedDescription;
            }
        }

        if (! empty($product['category']['slug'])) {
            $product['category']['name'] = self::categoryName(
                $product['category']['slug'],
                $product['category']['name'] ?? ''
            );
        }

        return $product;
    }

    /** @param  iterable<int, array<string, mixed>>  $products */
    public static function localizeProducts(iterable $products): array
    {
        return array_map(fn (array $product) => self::localizeProduct($product), [...$products]);
    }

    public static function localizeSubcategoryCard(array $card, string $categorySlug): array
    {
        $shortSlug = $card['short_slug'] ?? DemoProductService::normalizeSubcategorySlug($card['slug'] ?? '', $categorySlug);

        if ($shortSlug) {
            $card['name'] = self::subcategoryName($shortSlug, $card['name'] ?? $shortSlug);
            $card['description'] = self::subcategoryDescription($shortSlug, $card['description'] ?? '');
        }

        return $card;
    }

    public static function localizeSubcategoryMeta(array $meta, string $categorySlug): array
    {
        $shortSlug = DemoProductService::normalizeSubcategorySlug($meta['slug'] ?? '', $categorySlug);

        if ($shortSlug) {
            $meta['name'] = self::subcategoryName($shortSlug, $meta['name'] ?? $shortSlug);
            $meta['description'] = self::subcategoryDescription($shortSlug, $meta['description'] ?? '');
        }

        return $meta;
    }

    private static function normalizeDemoSlug(string $slug): string
    {
        $slug = Str::slug($slug);

        return str_starts_with($slug, 'demo-') ? substr($slug, 5) : $slug;
    }

    /** @param  LengthAwarePaginator  $paginator */
    public static function localizePaginator(LengthAwarePaginator $paginator): Paginator
    {
        return new Paginator(
            self::localizeProducts($paginator->items()),
            $paginator->total(),
            $paginator->perPage(),
            $paginator->currentPage(),
            ['path' => $paginator->path(), 'query' => request()->query()]
        );
    }

    private static function resolve(string $key, ?string $fallback): string
    {
        $fullKey = "catalog.{$key}";
        $value = Translations::get($fullKey);

        if ($value !== $fullKey && is_string($value) && $value !== '') {
            return $value;
        }

        return $fallback ?? $key;
    }
}
