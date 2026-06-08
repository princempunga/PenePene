<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SellerSalesExport;
use Carbon\Carbon;

class ReportController extends Controller
{
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index()
    {
        $seller = $this->seller();

        // Quick stats for the report page
        $stats = [
            'total_revenue'  => Order::where('seller_id', $seller->id)->whereIn('status', ['delivered'])->sum('total_amount'),
            'total_orders'   => Order::where('seller_id', $seller->id)->count(),
            'total_products' => Product::where('seller_id', $seller->id)->count(),
        ];

        return Inertia::render('Seller/Reports/Index', ['stats' => $stats]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'type'     => 'required|in:sales,products,stock',
            'format'   => 'required|in:pdf,excel,csv',
            'from'     => 'required|date',
            'to'       => 'required|date|after_or_equal:from',
        ]);

        $seller = $this->seller();
        $from   = Carbon::parse($request->from)->startOfDay();
        $to     = Carbon::parse($request->to)->endOfDay();

        switch ($request->format) {
            case 'pdf':
                return $this->generatePdf($seller, $request->type, $from, $to);
            case 'excel':
                return $this->generateExcel($seller, $request->type, $from, $to);
            case 'csv':
                return $this->generateCsv($seller, $request->type, $from, $to);
        }
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

            if ($type === 'sales') {
                fputcsv($handle, ['Order #', 'Date', 'Buyer', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status']);
                foreach ($data as $order) {
                    fputcsv($handle, [
                        $order->order_number,
                        $order->created_at->format('Y-m-d'),
                        $order->buyer->user->name ?? 'N/A',
                        $order->items->count(),
                        $order->subtotal,
                        $order->shipping_cost,
                        $order->total_amount,
                        $order->status,
                    ]);
                }
            } elseif ($type === 'products') {
                fputcsv($handle, ['Product', 'Category', 'Price', 'Stock', 'Status', 'Views']);
                foreach ($data as $product) {
                    fputcsv($handle, [
                        $product->name,
                        $product->category->name ?? 'N/A',
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

    // Kept for future async report generation
    public function download(int $report)
    {
        abort(404);
    }
}
