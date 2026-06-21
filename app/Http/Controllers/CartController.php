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

    public function checkout(Request $request)
    {
        if (! auth()->check()) {
            return redirect()
                ->guest(route('login'))
                ->with('info', 'Please sign in to request a quote.');
        }

        $cart = $this->getCart();

        if (empty($cart)) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'Your cart is empty.']);
        }

        $buyer = auth()->user()->buyer ?? \App\Models\Buyer::create(['user_id' => auth()->id()]);
        
        // Resolve items and group by seller
        $lineItems = [];
        foreach ($cart as $cartKey => $item) {
            $quantity = max(1, (int) ($item['quantity'] ?? 1));

            if ($this->isDemoCartKey($cartKey)) {
                $demo = DemoProductService::findBySlug($cartKey);
                if (! $demo) continue;
                $product = DemoProductService::ensureDatabaseProduct($demo);
            } else {
                $product = Product::with('seller')->active()->find($cartKey);
            }

            if (! $product || ! $product->seller_id) {
                continue;
            }

            $lineItems[] = [
                'product'    => $product,
                'seller_id'  => $product->seller_id,
                'quantity'   => $quantity,
            ];
        }

        if (empty($lineItems)) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'No valid products found in your cart.']);
        }

        $grouped = collect($lineItems)->groupBy('seller_id');

        foreach ($grouped as $sellerId => $items) {
            $seller = \App\Models\Seller::find($sellerId);
            if (!$seller) continue;

            $conversation = \App\Models\Conversation::firstOrCreate([
                'buyer_id'  => $buyer->id,
                'seller_id' => $seller->id,
            ]);

            $messageBody = "Bonjour, je souhaite demander un devis pour les articles suivants :\n\n";
            
            foreach ($items as $item) {
                $product = $item['product'];
                $messageBody .= "- {$product->name} (Quantité : {$item['quantity']})\n";
                
                // Also send a product card message so they see the product UI
                $image = $product->images?->where('is_primary', true)->first() ?? $product->images?->first();
                $imageUrl = $image ? (str_starts_with($image->image_path, 'images/') ? '/' . $image->image_path : '/storage/' . $image->image_path) : null;
                
                $snapshot = [
                    'product_id'   => $product->id,
                    'name'         => $product->name,
                    'price'        => $product->sale_price ?? $product->price,
                    'currency'     => $product->currency ?? 'CDF',
                    'category'     => $product->category?->name,
                    'seller_name'  => $seller?->business_name,
                    'seller_slug'  => $seller?->slug,
                    'slug'         => $product->slug,
                    'image_url'    => $imageUrl,
                    'product_url'  => '/products/' . $product->slug,
                ];

                \App\Models\Message::create([
                    'conversation_id'  => $conversation->id,
                    'sender_id'        => $buyer->id,
                    'receiver_id'      => $seller->user_id,
                    'message_type'     => 'product',
                    'product_id'       => $product->id,
                    'product_snapshot' => $snapshot,
                    'body'             => null,
                ]);
            }

            \App\Models\Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $buyer->id,
                'receiver_id'     => $seller->user_id,
                'message_type'    => 'text',
                'body'            => $messageBody,
            ]);

            $conversation->update(['last_message_at' => now()]);
        }

        $this->saveCart([]);

        return redirect()
            ->route('buyer.messages.index')
            ->with('success', 'Votre demande de devis a été envoyée aux vendeurs.');
    }
}
