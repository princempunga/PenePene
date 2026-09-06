<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class ProductListing
{
    public static function paginateOrDemo(
        Builder|Relation $query,
        ?Category $category = null,
        ?Subcategory $subcategory = null,
        ?string $rawSubcategorySlug = null,
        int $perPage = 12
    ): LengthAwarePaginator {
        return $query->paginate($perPage)->withQueryString();
    }
}
