<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Subcategory;
use App\Services\DemoProductService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ProductListing
{
    public static function paginateOrDemo(
        Builder|Relation $query,
        ?Category $category = null,
        ?Subcategory $subcategory = null,
        ?string $rawSubcategorySlug = null,
        int $perPage = 12
    ): array {
        $paginator = $query->paginate($perPage)->withQueryString();

        if ($paginator->total() > 0) {
            return [
                'products'   => $paginator,
                'using_demo' => false,
            ];
        }

        $demoItems = self::resolveDemoItems($category, $subcategory, $rawSubcategorySlug);

        if (! empty($demoItems)) {
            $demoItems = DemoProductService::filterDemo($demoItems, request()->all());
            $demoItems = DemoProductService::sortDemo($demoItems, request()->get('sort'));

            return [
                'products'   => self::demoPaginator($demoItems, $perPage),
                'using_demo' => true,
            ];
        }

        return [
            'products'   => $paginator,
            'using_demo' => false,
        ];
    }

    private static function resolveDemoItems(
        ?Category $category,
        ?Subcategory $subcategory,
        ?string $rawSubcategorySlug
    ): array {
        if (request()->get('filter') === 'sale') {
            return DemoProductService::flashDeals($category);
        }

        if ($subcategory || $rawSubcategorySlug) {
            return DemoProductService::forSubcategory($subcategory, $category, $rawSubcategorySlug);
        }

        if ($category) {
            return DemoProductService::forCategory($category);
        }

        return DemoProductService::generalCatalog();
    }

    public static function demoPaginator(array $items, int $perPage = 12): LengthAwarePaginator
    {
        $page = max(1, (int) request()->get('page', 1));
        $collection = collect($items);
        $total = $collection->count();
        $slice = $collection->forPage($page, $perPage)->values()->all();

        $query = request()->except('page');

        return new Paginator(
            $slice,
            $total,
            $perPage,
            $page,
            [
                'path'  => request()->getPathInfo() ?: '/',
                'query' => $query,
            ]
        );
    }
}
