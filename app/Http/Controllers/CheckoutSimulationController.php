<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\CheckoutService;
use App\Services\DemoProductService;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class CheckoutSimulationController extends Controller
{
    public function show()
    {
        if (! auth()->check()) {
            return redirect()
                ->guest(route('login'))
                ->with('info', 'Please sign in to complete your order.');
        }

        if (! DemoSimulationService::enabled()) {
            return redirect()->route('cart.index');
        }

        $cart = session('cart', []);

        if (empty($cart)) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'Your cart is empty.']);
        }

        $items = $this->buildCartItems($cart);
        $total = collect($items)->sum('subtotal');
        $user  = auth()->user();
        $demoSeller = DemoSimulationService::demoSeller();

        return Inertia::render('Checkout/Simulate', [
            'items'          => $items,
            'total'          => $total,
            'buyer'          => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone ?? null,
                'address' => $user->address ?? 'To be confirmed',
            ],
            'seller'         => $demoSeller ? [
                'business_name' => $demoSeller->business_name,
                'city'          => $demoSeller->city,
                'country'       => $demoSeller->country,
                'slug'          => $demoSeller->slug,
            ] : null,
            'paymentMethods' => [
                ['id' => 'mobile_money', 'label_key' => 'checkout_sim.mobile_money'],
                ['id' => 'card', 'label_key' => 'checkout_sim.card'],
                ['id' => 'cash_on_delivery', 'label_key' => 'checkout_sim.cash_on_delivery'],
                ['id' => 'demo', 'label_key' => 'checkout_sim.demo_payment'],
            ],
        ]);
    }

    public function pay(Request $request, CheckoutService $checkoutService)
    {
        if (! auth()->check()) {
            return redirect()->guest(route('login'));
        }

        if (! DemoSimulationService::enabled()) {
            return redirect()->route('cart.checkout');
        }

        $request->validate([
            'payment_method'    => 'required|in:mobile_money,card,cash_on_delivery,demo',
            'simulation_result' => 'nullable|in:success,failed',
        ]);

        $cart = session('cart', []);

        if (empty($cart)) {
            return redirect()
                ->route('cart.index')
                ->withErrors(['cart' => 'Your cart is empty.']);
        }

        $method = $request->payment_method;
        $result = $request->simulation_result;

        if ($method === 'demo' && $result === 'failed') {
            return back()->withErrors([
                'payment' => __('checkout_sim.payment_failed'),
            ]);
        }

        $paymentStatus = match ($method) {
            'cash_on_delivery' => 'pending',
            'demo'             => $result === 'success' ? 'paid' : 'pending',
            default            => 'paid',
        };

        $orderStatus = $paymentStatus === 'paid' ? 'confirmed' : 'pending';

        try {
            $orders = $checkoutService->process(auth()->user(), $cart, [
                'payment_status' => $paymentStatus,
                'payment_method' => $method,
                'order_status'   => $orderStatus,
            ]);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['cart' => $exception->getMessage()]);
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors(['cart' => 'We could not place your order. Please try again.']);
        }

        session(['cart' => []]);

        $primaryOrder = $orders[0];

        return redirect()
            ->route('orders.confirmation', $primaryOrder)
            ->with('success', $paymentStatus === 'paid'
                ? __('checkout_sim.payment_success')
                : __('checkout_sim.order_placed_cod'));
    }

    /** @return array<int, array<string, mixed>> */
    private function buildCartItems(array $cart): array
    {
        $items = [];

        foreach ($cart as $cartKey => $item) {
            if (str_starts_with($cartKey, 'demo-')) {
                $price    = (float) ($item['sale_price'] ?? $item['price']);
                $quantity = (int) ($item['quantity'] ?? 1);

                $items[] = [
                    'id'        => $cartKey,
                    'name'      => $item['name'],
                    'slug'      => $item['slug'] ?? $cartKey,
                    'price'     => $price,
                    'quantity'  => $quantity,
                    'subtotal'  => $price * $quantity,
                    'image_url' => $item['image'] ?? DemoProductService::defaultImage(),
                    'seller_name' => $item['seller_name'] ?? 'Demo Store',
                ];

                continue;
            }

            $product = Product::with('seller', 'images')->find($cartKey);

            if ($product) {
                $price    = (float) ($product->sale_price ?? $product->price);
                $quantity = (int) ($item['quantity'] ?? 1);
                $imagePath = $product->images->where('is_primary', true)->first()?->image_path
                    ?? $product->images->first()?->image_path;

                $items[] = [
                    'id'          => $product->id,
                    'name'        => $product->name,
                    'slug'        => $product->slug,
                    'price'       => $price,
                    'quantity'    => $quantity,
                    'subtotal'    => $price * $quantity,
                    'image_url'   => $imagePath ? '/storage/' . $imagePath : '/images/demo-products/default.jpg',
                    'seller_name' => $product->seller?->business_name,
                ];
            }
        }

        return $items;
    }
}
