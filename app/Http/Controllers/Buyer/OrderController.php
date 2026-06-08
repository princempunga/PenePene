<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $buyer = $request->user()->buyer;

        $orders = Order::with(['items.product.images', 'seller'])
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Buyer/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $buyer = $request->user()->buyer;

        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        $order->load(['items.product.images', 'seller.user']);

        return Inertia::render('Buyer/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'quantity'         => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'notes'            => 'nullable|string',
        ]);

        $buyer   = $request->user()->buyer;
        $product = Product::with('seller')->findOrFail($request->product_id);

        // Stock check
        $available = $product->initial_stock - $product->confirmed_sales;
        if ($request->quantity > $available) {
            return back()->withErrors(['quantity' => "Only {$available} items available."]);
        }

        // Calculate totals
        $unitPrice = $product->sale_price ?? $product->price;
        $subtotal  = $unitPrice * $request->quantity;

        $order = Order::create([
            'buyer_id'         => $buyer->id,
            'seller_id'        => $product->seller_id,
            'subtotal'         => $subtotal,
            'total'            => $subtotal,
            'status'           => 'pending',
            'delivery_address' => $request->shipping_address,
            'buyer_notes'      => $request->notes,
        ]);

        OrderItem::create([
            'order_id'     => $order->id,
            'product_id'   => $product->id,
            'product_name' => $product->name,
            'price'        => $unitPrice,
            'quantity'     => $request->quantity,
            'subtotal'     => $subtotal,
        ]);

        return redirect()->route('buyer.orders.show', $order)
            ->with('success', 'Order placed successfully!');
    }

    public function cancel(Request $request, Order $order)
    {
        $buyer = $request->user()->buyer;

        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return back()->withErrors(['status' => 'This order cannot be cancelled.']);
        }

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Order cancelled successfully.');
    }
}
