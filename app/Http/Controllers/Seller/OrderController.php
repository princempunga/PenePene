<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Notification;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Order::with('buyer.user')
            ->where('seller_id', $seller->id)
            ->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15)->withQueryString();

        return Inertia::render('Seller/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
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

        // Logic check: only pending can be cancelled or confirmed, etc. (Can add more strict validation here)
        $oldStatus = $order->status;
        
        $order->update(['status' => $request->status]);

        // If status changed to confirmed, notify buyer
        if ($oldStatus !== $request->status) {
            Notification::create([
                'user_id' => $order->buyer->user_id,
                'title' => "Order Status Updated",
                'body' => "Your order {$order->order_number} is now {$request->status}.",
                'type' => 'order',
            ]);
        }

        return back()->with('success', 'Order status updated successfully.');
    }
}
