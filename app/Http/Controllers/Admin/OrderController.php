<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    use SimulatesData;

    public function index(Request $request)
    {
        $query = Order::with(['buyer.user', 'seller']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        [$orders, $usingDemo] = $this->demoPageOr(
            $orders,
            AdminDemoDataService::orders($request->status),
            20
        );

        return Inertia::render('Admin/Orders/Index', [
            'orders'        => $orders,
            'filters'       => $request->only('status'),
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['buyer.user', 'seller', 'items.product.images']);

        return Inertia::render('Admin/Orders/Show', ['order' => $order]);
    }
}
