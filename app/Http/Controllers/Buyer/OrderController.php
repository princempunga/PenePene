<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Buyer;
use App\Models\Conversation;
use App\Models\ConversationUserState;
use App\Models\Message;
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

    public function contactSeller(Request $request, Order $order)
    {
        $user = $request->user();
        $buyer = $user->buyer;

        if (! $buyer || $order->buyer_id !== $buyer->id) {
            abort(403);
        }

        $order->load(['items.product', 'seller.user']);

        if (! $order->seller_id || ! $order->seller?->user_id) {
            return back()->withErrors(['contact' => 'This seller cannot be contacted right now.']);
        }

        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $user->id, 'seller_id' => $order->seller_id],
            ['last_message_at' => now()]
        );

        ConversationUserState::forUser($conversation, $user->id)->update([
            'deleted_at' => null,
            'archived_at' => null,
        ]);

        $productName = $order->items->first()?->product_name
            ?? $order->items->first()?->product?->name
            ?? 'your order';

        $contextBody = "Hello, I am contacting you about Order #{$order->id}: {$productName}.";

        $hasOrderContext = $conversation->messages()
            ->where('body', 'like', "%Order #{$order->id}:%")
            ->exists();

        if (! $hasOrderContext) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $user->id,
                'receiver_id'     => $order->seller->user_id,
                'body'            => $contextBody,
                'message_type'    => 'text',
            ]);

            $conversation->update(['last_message_at' => now()]);
        }

        return redirect()->route('buyer.messages.show', $conversation);
    }

    public function confirmation(Request $request, Order $order)
    {
        $buyer = $request->user()->buyer ?? Buyer::create(['user_id' => $request->user()->id]);

        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        $order->load(['items.product.images', 'seller']);

        return Inertia::render('Buyer/Orders/Confirmation', [
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

        $product->increment('confirmed_sales', $request->quantity);

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
