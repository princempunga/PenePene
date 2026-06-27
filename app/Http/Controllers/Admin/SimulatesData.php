<?php

namespace App\Http\Controllers\Admin;

use App\Services\AdminDemoDataService;
use Illuminate\Pagination\LengthAwarePaginator;

trait SimulatesData
{
    protected function adminDemoEnabled(): bool
    {
        return AdminDemoDataService::enabled();
    }

    /**
     * If the paginated result has zero items, wrap simulated data in a paginator.
     */
    private function simulatePage(mixed $paginated, array $items, int $perPage = 20): mixed
    {
        if (! $this->adminDemoEnabled() || $paginated->total() > 0) {
            return $paginated;
        }

        return $this->wrapDemoPage($items, $perPage);
    }

    private function wrapDemoPage(array $items, int $perPage = 20): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            $items,
            count($items),
            $perPage,
            1,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    /** @return array{0: mixed, 1: bool} */
    private function demoPageOr(mixed $paginated, array $items, int $perPage = 20): array
    {
        $usingDemo = $this->adminDemoEnabled() && $paginated->total() === 0;

        return [
            $usingDemo ? $this->wrapDemoPage($items, $perPage) : $paginated,
            $usingDemo,
        ];
    }
}
