<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AdminReportExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SponsoredProduct;
use App\Models\SupportTicket;
use App\Services\AdminDemoDataService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    use SimulatesData;

    public function index()
    {
        $stats = [
            'total_gmv'      => Order::whereIn('status', ['delivered'])->sum('total'),
            'total_orders'   => Order::count(),
            'total_sellers'  => Seller::where('status', 'verified')->count(),
            'total_products' => Product::where('status', 'active')->count(),
            'open_tickets'   => SupportTicket::where('status', 'open')->count(),
            'pending_ads'    => SponsoredProduct::where('status', 'pending')->count(),
        ];

        $usingDemo = $this->adminDemoEnabled()
            && ($stats['total_orders'] ?? 0) === 0
            && ($stats['total_gmv'] ?? 0) == 0;

        if ($usingDemo) {
            $stats = AdminDemoDataService::reportStats();
        }

        return Inertia::render('Admin/Reports/Index', [
            'stats'         => $stats,
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'type'   => 'required|in:sales,sellers,products,platform',
            'format' => 'required|in:pdf,excel,csv',
            'from'   => 'required|date',
            'to'     => 'required|date|after_or_equal:from',
        ]);

        $from = Carbon::parse($request->from)->startOfDay();
        $to   = Carbon::parse($request->to)->endOfDay();
        $data = $this->getData($request->type, $from, $to);

        $filename = "penepene_admin_{$request->type}_report_{$from->format('Y-m-d')}_to_{$to->format('Y-m-d')}";

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView("reports.admin.{$request->type}", [
                'data' => $data, 'from' => $from, 'to' => $to,
            ]);

            return $pdf->download("{$filename}.pdf");
        }

        if ($request->format === 'excel') {
            return Excel::download(new AdminReportExport($data, $request->type), "{$filename}.xlsx");
        }

        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=\"{$filename}.csv\""];
        $callback = function () use ($data, $request) {
            $handle = fopen('php://output', 'w');
            if ($request->type === 'sales') {
                fputcsv($handle, ['Order #', 'Date', 'Buyer', 'Seller', 'Total', 'Status']);
                foreach ($data as $order) {
                    fputcsv($handle, [
                        $order->order_number, $order->created_at->format('Y-m-d'),
                        optional(optional($order->buyer)->user)->name,
                        optional($order->seller)->business_name,
                        $order->total_amount, $order->status,
                    ]);
                }
            } elseif ($request->type === 'sellers') {
                fputcsv($handle, ['Business Name', 'City', 'Total Sales', 'Rating', 'Status']);
                foreach ($data as $seller) {
                    fputcsv($handle, [$seller->business_name, $seller->city, $seller->total_sales, $seller->average_rating, $seller->status]);
                }
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getData(string $type, $from, $to)
    {
        return match ($type) {
            'sales'    => Order::with(['buyer.user', 'seller'])->whereBetween('created_at', [$from, $to])->latest()->get(),
            'sellers'  => Seller::withCount('products')->with('user')->whereBetween('created_at', [$from, $to])->get(),
            'products' => Product::with(['seller', 'category'])->whereBetween('created_at', [$from, $to])->get(),
            'platform' => collect([
                'orders'   => Order::whereBetween('created_at', [$from, $to])->count(),
                'revenue'  => Order::whereIn('status', ['delivered'])->whereBetween('created_at', [$from, $to])->sum('total'),
                'sellers'  => Seller::whereBetween('created_at', [$from, $to])->count(),
                'products' => Product::whereBetween('created_at', [$from, $to])->count(),
            ]),
            default    => collect(),
        };
    }

    public function download(int $report)
    {
        abort(404);
    }
}
