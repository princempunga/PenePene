<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Seller;
use App\Models\Category;
use Carbon\Carbon;

class GlobalSalesController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with([
            'buyer.user',
            'seller',
            'items.product.category',
            'items.product.subcategory',
        ])->latest();

        // ── Date filters ─────────────────────────────────────────────────────────
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // ── Seller filter ─────────────────────────────────────────────────────────
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        // ── Status filter ──────────────────────────────────────────────────────────
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // ── Category filter (via order items) ──────────────────────────────────────
        if ($request->filled('category_id')) {
            $query->whereHas('items.product', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // ── Subcategory filter ──────────────────────────────────────────────────────
        if ($request->filled('subcategory_id')) {
            $query->whereHas('items.product', function ($q) use ($request) {
                $q->where('subcategory_id', $request->subcategory_id);
            });
        }

        // ── Product name search ───────────────────────────────────────────────────
        if ($request->filled('product')) {
            $query->whereHas('items.product', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product . '%');
            });
        }

        $orders = $query->paginate(25)->withQueryString();

        // ── Global KPIs (unfiltered) ──────────────────────────────────────────────
        $kpis = [
            'total_gmv'    => Order::whereIn('status', ['delivered'])->sum('total'),
            'total_orders' => Order::count(),
            'avg_order'    => Order::whereIn('status', ['delivered'])->avg('total') ?? 0,
        ];

        // ── Filter data for dropdowns ─────────────────────────────────────────────
        $sellers    = Seller::select('id', 'business_name')->orderBy('business_name')->get();
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Sales/Index', [
            'orders'     => $orders,
            'kpis'       => $kpis,
            'sellers'    => $sellers,
            'categories' => $categories,
            'filters'    => $request->only([
                'date_from', 'date_to', 'seller_id',
                'status', 'category_id', 'subcategory_id', 'product',
            ]),
        ]);
    }

    /**
     * Export orders as CSV with the same filters.
     */
    public function export(Request $request)
    {
        $query = Order::with(['buyer.user', 'seller', 'items.product.category'])->latest();

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('category_id')) {
            $query->whereHas('items.product', fn($q) => $q->where('category_id', $request->category_id));
        }

        $orders   = $query->get();
        $filename = 'penepene_sales_' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($orders) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8 compatibility
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Order #', 'Date', 'Statut', 'Acheteur', 'Vendeur',
                'Catégorie', 'Produits', 'Qté', 'Sous-total', 'Total', 'Devise',
            ]);

            foreach ($orders as $order) {
                $productNames = $order->items->pluck('product_name')->implode(', ');
                $totalQty     = $order->items->sum('quantity');
                $category     = optional(optional($order->items->first())->product)->category?->name ?? 'N/A';

                fputcsv($handle, [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i'),
                    $order->status,
                    optional(optional($order->buyer)->user)->name ?? 'N/A',
                    optional($order->seller)->business_name ?? 'N/A',
                    $category,
                    $productNames,
                    $totalQty,
                    $order->subtotal,
                    $order->total,
                    $order->currency,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
