<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Favorite;
use App\Models\Notification;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $buyer  = $user->buyer;

        $recentOrders = Order::with(['items.product.images', 'seller'])
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->take(5)
            ->get();

        $totalOrders   = Order::where('buyer_id', $buyer->id)->count();
        $totalSpent    = Order::where('buyer_id', $buyer->id)
                              ->whereIn('payment_status', ['paid', 'completed'])
                              ->sum('total_amount');
        $wishlistCount = Favorite::where('buyer_id', $buyer->id)->count();
        $unreadNotifs  = Notification::where('user_id', $user->id)
                              ->where('is_read', false)->count();

        return Inertia::render('Buyer/Dashboard', [
            'buyer'         => $buyer,
            'recentOrders'  => $recentOrders,
            'stats'         => [
                'totalOrders'   => $totalOrders,
                'totalSpent'    => $totalSpent,
                'wishlistCount' => $wishlistCount,
                'unreadNotifs'  => $unreadNotifs,
            ],
        ]);
    }
}
