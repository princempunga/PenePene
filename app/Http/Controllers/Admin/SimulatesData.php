<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Pagination\LengthAwarePaginator;

trait SimulatesData
{
    /**
     * If the paginated result has zero items, wrap simulated data in a paginator.
     */
    private function simulatePage(mixed $paginated, array $items): mixed
    {
        if ($paginated->total() > 0) {
            return $paginated;
        }

        return new LengthAwarePaginator($items, count($items), 20, 1, ['path' => request()->url()]);
    }
}
