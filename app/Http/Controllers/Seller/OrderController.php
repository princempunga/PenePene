<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    private const ALLOWED_TRANSITIONS = [
        'pending'   => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped'   => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
        'processing'=> ['shipped', 'cancelled'],
        'rejected'  => [],
    ];

    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Order::with(['buyer.user'])
            ->withCount('items')
            ->where('seller_id', $seller->id)
            ->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->paginate(15)->withQueryString();

        return Inertia::render('Seller/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $seller = $request->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403);
        }

        $order->load(['items.product.images', 'buyer.user']);

        return Inertia::render('Seller/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $seller = $request->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled',
        ]);

        $newStatus = $request->status;
        $allowed   = self::ALLOWED_TRANSITIONS[$order->status] ?? [];

        if (! in_array($newStatus, $allowed, true)) {
            return back()->withErrors([
                'status' => "Cannot change order status from {$order->status} to {$newStatus}.",
            ]);
        }

        $oldStatus = $order->status;
        $updates   = ['status' => $newStatus];

        if ($newStatus === 'confirmed') {
            $updates['confirmed_at'] = now();
        }

        if ($newStatus === 'delivered') {
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        if ($oldStatus !== $newStatus) {
            $order->load('buyer.user');
            $order->buyer->user->notify(new OrderStatusUpdated($order));
        }

        return back()->with('success', 'Order status updated successfully.');
    }
}
