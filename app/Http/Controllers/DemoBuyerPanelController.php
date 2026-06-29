<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Order;
use App\Models\User;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoBuyerPanelController extends Controller
{
    public function index()
    {
        abort_unless(DemoSimulationService::enabled(), 404);
        abort_unless(auth()->user()?->role === 'buyer', 403);

        $user = auth()->user();
        $buyer = $user->buyer;

        if (! $buyer) {
            abort(404, 'Demo buyer profile not found.');
        }

        $orders = Order::with(['seller', 'items'])
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Demo/BuyerPanel', [
            'stats' => [
                'orders'       => Order::where('buyer_id', $buyer->id)->count(),
                'wishlist'     => Favorite::where('buyer_id', $buyer->id)->count(),
                'pending'      => Order::where('buyer_id', $buyer->id)->where('status', 'pending')->count(),
                'delivered'    => Order::where('buyer_id', $buyer->id)->where('status', 'delivered')->count(),
            ],
            'recentOrders' => $orders->map(fn (Order $order) => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'seller_name'  => $order->seller?->business_name ?? '—',
                'total'        => (float) $order->total,
                'status'       => $order->status,
                'items_count'  => $order->items->count(),
                'created_at'   => $order->created_at?->toISOString(),
            ]),
            'quickLinks' => DemoSimulationService::buyerQuickLinks(),
        ]);
    }
}
