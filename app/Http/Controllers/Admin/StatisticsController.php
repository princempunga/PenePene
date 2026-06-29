<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Seller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Tableau de bord statistiques administrateur avec comparaison de périodes.
 */
class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $period1From = $request->filled('p1_from')
            ? Carbon::parse($request->p1_from)->startOfDay()
            : Carbon::now()->startOfMonth();

        $period1To = $request->filled('p1_to')
            ? Carbon::parse($request->p1_to)->endOfDay()
            : Carbon::now()->endOfDay();

        $period2From = $request->filled('p2_from')
            ? Carbon::parse($request->p2_from)->startOfDay()
            : Carbon::now()->subMonth()->startOfMonth();

        $period2To = $request->filled('p2_to')
            ? Carbon::parse($request->p2_to)->endOfDay()
            : Carbon::now()->subMonth()->endOfMonth();

        $completedStatuses = ['confirmed', 'shipped', 'delivered'];

        $period1 = $this->aggregatePeriod($period1From, $period1To, $completedStatuses);
        $period2 = $this->aggregatePeriod($period2From, $period2To, $completedStatuses);

        $comparison = [
            'sales'       => $this->evolution($period1['total_orders'], $period2['total_orders']),
            'revenue'     => $this->evolution($period1['total_revenue'], $period2['total_revenue']),
            'commissions' => $this->evolution($period1['total_commissions'], $period2['total_commissions']),
        ];

        return Inertia::render('Admin/Statistics/Index', [
            'period1'    => $period1,
            'period2'    => $period2,
            'comparison' => $comparison,
            'filters'    => [
                'p1_from' => $period1From->format('Y-m-d'),
                'p1_to'   => $period1To->format('Y-m-d'),
                'p2_from' => $period2From->format('Y-m-d'),
                'p2_to'   => $period2To->format('Y-m-d'),
            ],
        ]);
    }

    private function aggregatePeriod(Carbon $from, Carbon $to, array $statuses): array
    {
        $ordersQuery = Order::whereBetween('created_at', [$from, $to]);
        $completedQuery = (clone $ordersQuery)->whereIn('status', $statuses);

        $totalRevenue = (float) (clone $completedQuery)->sum('total');
        $totalCommissions = (float) Commission::whereBetween('created_at', [$from, $to])->sum('commission_amount');

        return [
            'label'             => $from->format('d/m/Y') . ' → ' . $to->format('d/m/Y'),
            'total_orders'      => (clone $ordersQuery)->count(),
            'total_revenue'     => $totalRevenue,
            'total_commissions' => $totalCommissions,
            'by_seller'         => $this->salesBySeller($from, $to, $statuses),
            'by_product'        => $this->salesByProduct($from, $to, $statuses),
            'by_category'       => $this->salesByCategory($from, $to, $statuses),
            'by_subcategory'    => $this->salesBySubcategory($from, $to, $statuses),
        ];
    }

    private function salesBySeller(Carbon $from, Carbon $to, array $statuses): array
    {
        return Order::query()
            ->select('seller_id')
            ->selectRaw('COUNT(*) as order_count')
            ->selectRaw('SUM(total) as revenue')
            ->whereBetween('created_at', [$from, $to])
            ->whereIn('status', $statuses)
            ->groupBy('seller_id')
            ->with('seller:id,business_name')
            ->orderByDesc('revenue')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'seller_id'    => $row->seller_id,
                'seller_name'  => $row->seller?->business_name ?? 'N/D',
                'order_count'  => (int) $row->order_count,
                'revenue'      => (float) $row->revenue,
                'commissions'  => (float) Commission::where('seller_id', $row->seller_id)
                    ->whereBetween('created_at', [$from, $to])
                    ->sum('commission_amount'),
            ])
            ->all();
    }

    private function salesByProduct(Carbon $from, Carbon $to, array $statuses): array
    {
        return OrderItem::query()
            ->select('product_id', 'product_name')
            ->selectRaw('SUM(quantity) as units_sold')
            ->selectRaw('SUM(subtotal) as revenue')
            ->whereHas('order', fn ($q) => $q
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', $statuses))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('revenue')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'product_id'   => $row->product_id,
                'product_name' => $row->product_name,
                'units_sold'   => (int) $row->units_sold,
                'revenue'      => (float) $row->revenue,
            ])
            ->all();
    }

    private function salesByCategory(Carbon $from, Carbon $to, array $statuses): array
    {
        return OrderItem::query()
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name')
            ->selectRaw('SUM(order_items.quantity) as units_sold')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->whereHas('order', fn ($q) => $q
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', $statuses))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'category_id'   => $row->id,
                'category_name' => $row->name,
                'units_sold'    => (int) $row->units_sold,
                'revenue'       => (float) $row->revenue,
            ])
            ->all();
    }

    private function salesBySubcategory(Carbon $from, Carbon $to, array $statuses): array
    {
        return OrderItem::query()
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('subcategories', 'products.subcategory_id', '=', 'subcategories.id')
            ->select('subcategories.id', 'subcategories.name')
            ->selectRaw('SUM(order_items.quantity) as units_sold')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->whereHas('order', fn ($q) => $q
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', $statuses))
            ->groupBy('subcategories.id', 'subcategories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'subcategory_id'   => $row->id,
                'subcategory_name' => $row->name,
                'units_sold'       => (int) $row->units_sold,
                'revenue'          => (float) $row->revenue,
            ])
            ->all();
    }

    private function evolution(float $current, float $previous): array
    {
        if ($previous == 0) {
            return [
                'current'  => $current,
                'previous' => $previous,
                'change'   => $current > 0 ? 100 : 0,
                'trend'    => $current >= $previous ? 'up' : 'down',
            ];
        }

        $change = (($current - $previous) / $previous) * 100;

        return [
            'current'  => $current,
            'previous' => $previous,
            'change'   => round($change, 1),
            'trend'    => $change >= 0 ? 'up' : 'down',
        ];
    }
}
