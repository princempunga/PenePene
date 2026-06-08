<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Get the current cart from session.
     */
    private function getCart(): array
    {
        return session('cart', []);
    }

    /**
     * Save the cart back to session.
     */
    private function saveCart(array $cart): void
    {
        session(['cart' => $cart]);
    }

    /**
     * Display the cart page.
     */
    public function index()
    {
        $cart = $this->getCart();
        $items = [];

        foreach ($cart as $productId => $item) {
            $product = Product::with('images')->find($productId);
            if ($product) {
                $price = $product->sale_price ?? $product->price;
                $items[] = [
                    'id'          => $product->id,
                    'name'        => $product->name,
                    'slug'        => $product->slug,
                    'price'       => $price,
                    'original_price' => $product->price,
                    'sale_price'  => $product->sale_price,
                    'quantity'    => $item['quantity'],
                    'subtotal'    => $price * $item['quantity'],
                    'image'       => $product->images->where('is_primary', true)->first()?->image_path
                                     ?? $product->images->first()?->image_path,
                    'stock'       => max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0)),
                    'seller_name' => $product->seller?->business_name,
                ];
            }
        }

        $total = collect($items)->sum('subtotal');

        return Inertia::render('Cart/Index', [
            'items' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'sometimes|integer|min:1|max:100',
        ]);

        $product = Product::findOrFail($request->product_id);
        $quantity = $request->input('quantity', 1);

        // Check stock
        $available = max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0));
        if ($quantity > $available) {
            return back()->withErrors(['quantity' => "Only {$available} items available."]);
        }

        $cart = $this->getCart();
        $productId = (string) $product->id;

        if (isset($cart[$productId])) {
            $newQty = $cart[$productId]['quantity'] + $quantity;
            $cart[$productId]['quantity'] = min($newQty, $available);
        } else {
            $cart[$productId] = ['quantity' => $quantity];
        }

        $this->saveCart($cart);

        $cartCount = collect($cart)->sum('quantity');

        // Return JSON for AJAX requests, redirect for normal form submissions
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success'    => true,
                'message'    => "'{$product->name}' added to cart!",
                'cart_count' => $cartCount,
            ]);
        }

        return back()->with('success', "'{$product->name}' added to your cart!");
    }

    /**
     * Update a product's quantity in the cart.
     */
    public function update(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'quantity'   => 'required|integer|min:0',
        ]);

        $cart = $this->getCart();
        $productId = (string) $request->product_id;

        if ($request->quantity <= 0) {
            unset($cart[$productId]);
        } else {
            if (isset($cart[$productId])) {
                $cart[$productId]['quantity'] = $request->quantity;
            }
        }

        $this->saveCart($cart);

        return redirect()->route('cart.index');
    }

    /**
     * Remove a product from the cart.
     */
    public function remove(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
        ]);

        $cart = $this->getCart();
        unset($cart[(string) $request->product_id]);
        $this->saveCart($cart);

        return redirect()->route('cart.index');
    }

    /**
     * Clear the entire cart.
     */
    public function clear()
    {
        $this->saveCart([]);
        return redirect()->route('cart.index');
    }

    /**
     * Proceed to checkout — requires auth.
     * If not authenticated, store intended URL and redirect to login.
     */
    public function checkout(Request $request)
    {
        if (!auth()->check()) {
            session(['url.intended' => route('cart.index')]);
            return redirect()->route('login')->with('info', 'Please sign in to complete your order.');
        }

        $cart = $this->getCart();

        if (empty($cart)) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Your cart is empty.']);
        }

        $user   = auth()->user();
        $buyer  = $user->buyer;

        if (!$buyer) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Buyer profile not found.']);
        }

        // Group cart items by seller and create one order per seller
        $productIds = array_keys($cart);
        $products   = Product::with('seller')->whereIn('id', $productIds)->get()->keyBy('id');
        $bySeller   = [];

        foreach ($cart as $productId => $item) {
            $product = $products[$productId] ?? null;
            if (!$product) continue;

            $sellerId = $product->seller_id;
            if (!isset($bySeller[$sellerId])) {
                $bySeller[$sellerId] = [];
            }
            $bySeller[$sellerId][] = ['product' => $product, 'quantity' => $item['quantity']];
        }

        $orders = [];
        foreach ($bySeller as $sellerId => $items) {
            $subtotal = 0;
            $orderItems = [];
            foreach ($items as $entry) {
                $product  = $entry['product'];
                $qty      = $entry['quantity'];
                $price    = $product->sale_price ?? $product->price;
                $subtotal += $price * $qty;
                $orderItems[] = $entry;
            }

            $order = \App\Models\Order::create([
                'buyer_id'         => $buyer->id,
                'seller_id'        => $sellerId,
                'order_number'     => 'ORD-' . strtoupper(uniqid()),
                'subtotal'         => $subtotal,
                'shipping_cost'    => 0,
                'total_amount'     => $subtotal,
                'status'           => 'pending',
                'payment_status'   => 'pending',
                'shipping_address' => $user->address ?? 'To be confirmed',
                'notes'            => null,
            ]);

            foreach ($orderItems as $entry) {
                $product = $entry['product'];
                $qty     = $entry['quantity'];
                $price   = $product->sale_price ?? $product->price;

                \App\Models\OrderItem::create([
                    'order_id'    => $order->id,
                    'product_id'  => $product->id,
                    'seller_id'   => $sellerId,
                    'quantity'    => $qty,
                    'unit_price'  => $price,
                    'total_price' => $price * $qty,
                ]);
            }

            $orders[] = $order;
        }

        // Clear cart after successful order
        $this->saveCart([]);

        if (count($orders) === 1) {
            return redirect()->route('buyer.orders.show', $orders[0])
                ->with('success', 'Order placed successfully!');
        }

        return redirect()->route('buyer.orders.index')
            ->with('success', count($orders) . ' orders placed successfully!');
    }
}
