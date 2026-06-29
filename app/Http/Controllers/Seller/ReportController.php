<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StatsDownloadRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SellerSalesExport;
use Carbon\Carbon;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index(Request $request)
    {
        $seller = $this->seller();

        $from = $request->filled('from')
            ? Carbon::parse($request->from)->startOfDay()
            : Carbon::now()->subDays(29)->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse($request->to)->endOfDay()
            : Carbon::now()->endOfDay();

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $deliveredStatuses = ['delivered'];

        $ordersQuery = Order::where('seller_id', $seller->id)
            ->whereBetween('created_at', [$from, $to]);

        $stats = [
            'total_revenue'  => (clone $ordersQuery)->whereIn('status', $deliveredStatuses)->sum('total'),
            'total_orders'   => (clone $ordersQuery)->count(),
            'delivered'      => (clone $ordersQuery)->whereIn('status', $deliveredStatuses)->count(),
            'pending'        => (clone $ordersQuery)->where('status', 'pending')->count(),
            'total_products' => Product::where('seller_id', $seller->id)->count(),
            'avg_order_value'=> (clone $ordersQuery)->whereIn('status', $deliveredStatuses)->avg('total') ?? 0,
            'currency'       => 'CDF',
        ];

        $days = min($from->diffInDays($to) + 1, 31);
        $revenueTrend = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $to->copy()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $amount = Order::where('seller_id', $seller->id)
                ->whereIn('status', $deliveredStatuses)
                ->whereDate('created_at', $dateStr)
                ->sum('total');

            $revenueTrend[] = [
                'date'   => $date->locale('fr')->translatedFormat('j M'),
                'amount' => (float) $amount,
            ];
        }

        $topProducts = OrderItem::query()
            ->selectRaw('product_name, SUM(quantity) as units_sold, SUM(subtotal) as revenue')
            ->whereHas('order', function ($q) use ($seller, $from, $to) {
                $q->where('seller_id', $seller->id)
                    ->whereBetween('created_at', [$from, $to])
                    ->whereIn('status', ['delivered', 'confirmed', 'shipped']);
            })
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'name'       => $row->product_name,
                'units_sold' => (int) $row->units_sold,
                'revenue'    => (float) $row->revenue,
            ]);

        $recentOrders = Order::with(['buyer.user', 'items'])
            ->where('seller_id', $seller->id)
            ->whereBetween('created_at', [$from, $to])
            ->latest()
            ->take(8)
            ->get();

        $downloadRequests = StatsDownloadRequest::where('seller_id', $seller->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Seller/Reports/Index', [
            'stats'            => $stats,
            'revenueTrend'     => $revenueTrend,
            'topProducts'      => $topProducts,
            'recentOrders'     => $recentOrders,
            'downloadRequests' => $downloadRequests,
            'filters'          => [
                'from' => $from->format('Y-m-d'),
                'to'   => $to->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Le vendeur demande le téléchargement — approbation admin requise.
     */
    public function requestDownload(Request $request)
    {
        $request->validate([
            'type'   => 'required|in:sales,products,stock',
            'format' => 'required|in:pdf,excel,csv',
            'from'   => 'required|date',
            'to'     => 'required|date|after_or_equal:from',
        ]);

        $seller = $this->seller();

        $existing = StatsDownloadRequest::where('seller_id', $seller->id)
            ->where('status', StatsDownloadRequest::STATUS_PENDING)
            ->where('report_type', $request->type)
            ->where('format', $request->format)
            ->where('date_from', $request->from)
            ->where('date_to', $request->to)
            ->exists();

        if ($existing) {
            return back()->withErrors(['request' => 'Une demande identique est déjà en attente.']);
        }

        StatsDownloadRequest::create([
            'seller_id'   => $seller->id,
            'report_type' => $request->type,
            'format'      => $request->format,
            'date_from'   => $request->from,
            'date_to'     => $request->to,
            'status'      => StatsDownloadRequest::STATUS_PENDING,
        ]);

        \App\Models\User::whereIn('role', ['admin', 'super_admin'])->each(function ($admin) use ($seller, $request) {
            Notification::create([
                'user_id'    => $admin->id,
                'type'       => 'report_request',
                'title'      => 'Nouvelle demande de rapport',
                'body'       => "{$seller->business_name} demande le téléchargement de statistiques ({$request->type}).",
                'action_url' => '/admin/stats-requests',
            ]);
        });

        return back()->with('success', 'Votre demande a été envoyée à l\'administrateur.');
    }

    /**
     * Téléchargement autorisé uniquement si la demande a été approuvée.
     */
    public function download(Request $request, StatsDownloadRequest $statsRequest)
    {
        $seller = $this->seller();

        if ($statsRequest->seller_id !== $seller->id) {
            abort(403);
        }

        if (! $statsRequest->canDownload()) {
            return back()->withErrors(['download' => 'Cette demande n\'est pas encore approuvée.']);
        }

        if ($request->query('token') !== $statsRequest->download_token) {
            abort(403);
        }

        $from = Carbon::parse($statsRequest->date_from)->startOfDay();
        $to   = Carbon::parse($statsRequest->date_to)->endOfDay();

        $statsRequest->update(['downloaded_at' => now()]);

        return match ($statsRequest->format) {
            'pdf'   => $this->generatePdf($seller, $statsRequest->report_type, $from, $to),
            'excel' => $this->generateExcel($seller, $statsRequest->report_type, $from, $to),
            'csv'   => $this->generateCsv($seller, $statsRequest->report_type, $from, $to),
            default => abort(400),
        };
    }

    private function generatePdf($seller, string $type, $from, $to)
    {
        $data = $this->getData($seller, $type, $from, $to);

        $pdf = Pdf::loadView("reports.seller.{$type}", [
            'seller'  => $seller,
            'data'    => $data,
            'from'    => $from,
            'to'      => $to,
            'type'    => $type,
        ]);

        $filename = "penepene_{$seller->slug}_{$type}_report_{$from->format('Y-m-d')}_to_{$to->format('Y-m-d')}.pdf";

        return $pdf->download($filename);
    }

    private function generateExcel($seller, string $type, $from, $to)
    {
        $data = $this->getData($seller, $type, $from, $to);
        $filename = "penepene_{$seller->slug}_{$type}_report_{$from->format('Y-m-d')}_to_{$to->format('Y-m-d')}.xlsx";

        return Excel::download(new SellerSalesExport($data, $type), $filename);
    }

    private function generateCsv($seller, string $type, $from, $to)
    {
        $data = $this->getData($seller, $type, $from, $to);
        $filename = "penepene_{$seller->slug}_{$type}_report_{$from->format('Y-m-d')}_to_{$to->format('Y-m-d')}.csv";

        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=\"{$filename}\""];

        $callback = function () use ($data, $type) {
            $handle = fopen('php://output', 'w');

            $orderStatusLabels = [
                'pending'   => 'En attente',
                'confirmed' => 'Confirmée',
                'shipped'   => 'Expédiée',
                'delivered' => 'Livrée',
                'cancelled' => 'Annulée',
            ];

            if ($type === 'sales') {
                fputcsv($handle, ['N° commande', 'Date', 'Acheteur', 'Articles', 'Sous-total (FC)', 'Livraison (FC)', 'Total (FC)', 'Statut']);
                foreach ($data as $order) {
                    fputcsv($handle, [
                        $order->order_number,
                        $order->created_at->format('Y-m-d'),
                        $order->buyer->user->name ?? 'N/D',
                        $order->items->count(),
                        $order->subtotal,
                        $order->shipping_cost,
                        $order->total_amount,
                        $orderStatusLabels[$order->status] ?? $order->status,
                    ]);
                }
            } elseif ($type === 'products') {
                fputcsv($handle, ['Produit', 'Catégorie', 'Prix (FC)', 'Stock', 'Statut', 'Vues']);
                foreach ($data as $product) {
                    fputcsv($handle, [
                        $product->name,
                        $product->category->name ?? 'N/D',
                        $product->price,
                        $product->available_stock,
                        $product->status,
                        $product->view_count,
                    ]);
                }
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getData($seller, string $type, $from, $to)
    {
        if ($type === 'sales') {
            return Order::with(['buyer.user', 'items'])
                ->where('seller_id', $seller->id)
                ->whereBetween('created_at', [$from, $to])
                ->latest()
                ->get();
        }

        if ($type === 'products') {
            return Product::with('category')
                ->where('seller_id', $seller->id)
                ->get();
        }

        if ($type === 'stock') {
            return Product::where('seller_id', $seller->id)
                ->whereRaw('(initial_stock - confirmed_sales) <= low_stock_threshold')
                ->get();
        }

        return collect();
    }
}
