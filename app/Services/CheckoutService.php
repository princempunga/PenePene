<?php

namespace App\Services;

use App\Models\Buyer;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CheckoutService
{
    public function process(User $user, array $cart): array
    {
        if (empty($cart)) {
            throw new RuntimeException('Your cart is empty.');
        }

        $buyer = $user->buyer ?? Buyer::create(['user_id' => $user->id]);
        $lineItems = $this->resolveLineItems($cart);

        if (empty($lineItems)) {
            throw new RuntimeException('No valid products found in your cart.');
        }

        return DB::transaction(function () use ($buyer, $user, $lineItems) {
            $orders = [];
            $grouped = collect($lineItems)->groupBy('seller_id');

            foreach ($grouped as $sellerId => $items) {
                $subtotal = $items->sum(fn (array $item) => $item['unit_price'] * $item['quantity']);

                $order = Order::create([
                    'buyer_id'         => $buyer->id,
                    'seller_id'        => $sellerId,
                    'subtotal'         => $subtotal,
                    'total'            => $subtotal,
                    'status'           => 'pending',
                    'delivery_address' => $user->address ?? 'To be confirmed',
                    'currency'         => 'USD',
                ]);

                foreach ($items as $item) {
                    /** @var Product $product */
                    $product = $item['product'];
                    $quantity = $item['quantity'];
                    $unitPrice = $item['unit_price'];
                    $lineTotal = $unitPrice * $quantity;

                    OrderItem::create([
                        'order_id'     => $order->id,
                        'product_id'   => $product->id,
                        'product_name' => $product->name,
                        'price'        => $unitPrice,
                        'quantity'     => $quantity,
                        'subtotal'     => $lineTotal,
                    ]);

                    $product->increment('confirmed_sales', $quantity);
                }

                $this->notifySeller($order);
                $orders[] = $order->fresh(['items.product.images', 'seller']);
            }

            return $orders;
        });
    }

    private function resolveLineItems(array $cart): array
    {
        $lineItems = [];

        foreach ($cart as $cartKey => $item) {
            $quantity = max(1, (int) ($item['quantity'] ?? 1));

            if ($this->isDemoCartKey($cartKey)) {
                $demo = DemoProductService::findBySlug($cartKey);

                if (! $demo) {
                    continue;
                }

                $product = DemoProductService::ensureDatabaseProduct($demo);
            } else {
                $product = Product::with('seller')->active()->find($cartKey);
            }

            if (! $product || ! $product->seller_id) {
                continue;
            }

            $available = max(0, ($product->initial_stock ?? 0) - ($product->confirmed_sales ?? 0));

            if ($available < $quantity) {
                throw new RuntimeException("Only {$available} units of {$product->name} are available.");
            }

            $lineItems[] = [
                'product'    => $product,
                'seller_id'  => $product->seller_id,
                'quantity'   => $quantity,
                'unit_price' => (float) ($product->sale_price ?? $product->price),
            ];
        }

        return $lineItems;
    }

    private function notifySeller(Order $order): void
    {
        $seller = Seller::with('user')->find($order->seller_id);

        if (! $seller?->user_id) {
            return;
        }

        Notification::create([
            'user_id'    => $seller->user_id,
            'type'       => 'order',
            'title'      => 'New Order Received',
            'body'       => "You received order {$order->order_number} from a buyer.",
            'action_url' => "/seller/orders/{$order->id}",
            'is_read'    => false,
        ]);
    }

    private function isDemoCartKey(string $key): bool
    {
        return str_starts_with($key, 'demo-');
    }
}
