<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\CheckoutService;
use App\Services\DemoProductService;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class CartController extends Controller
{
    private function getCart(): array
    {
        return session('cart', []);
    }

    private function saveCart(array $cart): void
    {
        session(['cart' => $cart]);
    }

    private function cartCount(array $cart): int
    {
        return (int) collect($cart)->sum('quantity');
    }

    private function isDemoCartKey(string $key): bool
    {
        return str_starts_with($key, 'demo-');
    }

    public function index()
    {
        $cart = $this->getCart();
        $items = [];

        foreach ($cart as $cartKey => $item) {
            if ($this->isDemoCartKey($cartKey)) {
                $price = (float) ($item['sale_price'] ?? $item['price']);
                $quantity = (int) ($item['quantity'] ?? 1);

                $items[] = [
                    'id'             => $cartKey,
                    'is_demo'        => true,
                    'name'           => $item['name'],
                    'slug'           => $item['slug'],
                    'price'          => $price,
                    'original_price' => (float) $item['price'],
                    'sale_price'     => $item['sale_price'] ?? null,
                    'quantity'       => $quantity,
                    'subtotal'       => $price * $quantity,
                    'image_url'      => $item['image'] ?? DemoProductService::defaultImage(),
                    'stock'          => 99,
                    'seller_name'    => $item['seller_name'] ?? 'Verified Seller',
                ];

                continue;
            }

            $product = Product::with('seller', 'images')->find($cartKey);

            if ($product) {
                $price = (float) ($product->sale_price ?? $product->price);
                $quantity = (int) ($item['quantity'] ?? 1);
                $imagePath = $product->images->where('is_primary', true)->first()?->image_path
                    ?? $product->images->first()?->image_path;

                $items[] = [
                    'id'             => $product->id,
                    'is_demo'        => false,
                    'name'           => $product->name,
                    'slug'           => $product->slug,
                    'price'          => $price,
                    'original_price' => (float) $product->price,
                    'sale_price'     => $product->sale_price,
                    'quantity'       => $quantity,
                    'subtotal'       => $price * $quantity,
                    'image_url'      => $imagePath ? '/storage/' . $imagePath : '/images/demo-products/default.jpg',
                    'stock'          => max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0)),
                    'seller_name'    => $product->seller?->business_name,
                ];
            }
        }

        $total = collect($items)->sum('subtotal');

        return Inertia::render('Cart/Index', [
            'items' => $items,
            'total' => $total,
        ]);
    }

    public function add(Request $request)
    {
        if ($request->filled('demo_slug')) {
            return $this->addDemo($request);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'sometimes|integer|min:1|max:100',
        ]);

        $product = Product::findOrFail($request->product_id);
        $quantity = (int) $request->input('quantity', 1);

        $available = max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0));

        if ($available < 1) {
            return back()->withErrors(['cart' => 'This product is currently out of stock.']);
        }

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

        return back()->with('success', 'Product added to cart');
    }

    private function addDemo(Request $request)
    {
        $request->validate([
            'demo_slug' => 'required|string|max:255',
            'quantity'  => 'sometimes|integer|min:1|max:10',
        ]);

        $demo = DemoProductService::findBySlug($request->demo_slug);

        if (! $demo) {
            return back()->withErrors(['cart' => 'This preview product could not be found.']);
        }

        $quantity = (int) $request->input('quantity', 1);
        $cartKey = $demo['slug'];
        $cart = $this->getCart();

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] = min(($cart[$cartKey]['quantity'] ?? 0) + $quantity, 10);
        } else {
            $cart[$cartKey] = array_merge(
                DemoProductService::cartSnapshot($demo),
                ['quantity' => $quantity]
            );
        }

        $this->saveCart($cart);

        return back()->with('success', 'Product added to cart');
    }

    public function update(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'quantity'   => 'required|integer|min:0',
        ]);

        $cart = $this->getCart();
        $cartKey = (string) $request->product_id;

        if ($request->quantity <= 0) {
            unset($cart[$cartKey]);
        } elseif (isset($cart[$cartKey])) {
            if ($this->isDemoCartKey($cartKey)) {
                $maxQty = 10;
            } else {
                $product = Product::find($cartKey);
                $maxQty = $product
                    ? max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0))
                    : 0;
            }

            $cart[$cartKey]['quantity'] = min($request->quantity, max($maxQty, 1));
        }

        $this->saveCart($cart);

        return redirect()->route('cart.index');
    }

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

    public function clear()
    {
        $this->saveCart([]);

        return redirect()->route('cart.index');
    }

    public function checkout(Request $request, CheckoutService $checkoutService)
    {
        if (! auth()->check()) {
            return redirect()
                ->guest(route('login'))
                ->with('info', 'Please sign in to complete your order.');
        }

        $cart = $this->getCart();

        if (empty($cart)) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'Your cart is empty.']);
        }

        if (DemoSimulationService::enabled()) {
            return redirect()->route('checkout.simulate');
        }

        try {
            $orders = $checkoutService->process(auth()->user(), $cart);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => $exception->getMessage()]);
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'We could not place your order. Please try again.']);
        }

        $this->saveCart([]);

        $primaryOrder = $orders[0];

        return redirect()
            ->route('orders.confirmation', $primaryOrder)
            ->with('success', count($orders) === 1
                ? 'Your order was placed successfully!'
                : count($orders) . ' orders were placed successfully!');
    }
}
