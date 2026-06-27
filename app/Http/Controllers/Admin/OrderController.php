<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['buyer.user', 'seller']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['buyer.user', 'seller', 'items.product.images']);

        return Inertia::render('Admin/Orders/Show', ['order' => $order]);
    }
}
