<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use App\Models\Review;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $seller = $user->seller;

        // Statistics
        $totalProducts = Product::where('seller_id', $seller->id)->count();
        $totalOrders   = Order::where('seller_id', $seller->id)->count();
        $totalRevenue  = Order::where('seller_id', $seller->id)
                              ->whereIn('payment_status', ['paid', 'completed'])
                              ->sum('total_amount');
        
        $pendingOrders = Order::where('seller_id', $seller->id)
                              ->where('status', 'pending')
                              ->count();

        // Recent Orders
        $recentOrders = Order::with('buyer.user')
            ->where('seller_id', $seller->id)
            ->latest()
            ->take(5)
            ->get();

        // Recent Reviews
        $recentReviews = Review::with('buyer.user')
            ->where('seller_id', $seller->id)
            ->where('reviewable_type', 'seller')
            ->latest()
            ->take(3)
            ->get();

        // Weekly Revenue Chart Data (Last 7 days)
        $revenueData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $sum = Order::where('seller_id', $seller->id)
                ->whereIn('payment_status', ['paid', 'completed'])
                ->whereDate('created_at', $date)
                ->sum('total_amount');
            
            $revenueData[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'amount' => $sum
            ];
        }

        return Inertia::render('Seller/Dashboard', [
            'seller' => $seller,
            'stats'  => [
                'totalProducts' => $totalProducts,
                'totalOrders'   => $totalOrders,
                'totalRevenue'  => $totalRevenue,
                'pendingOrders' => $pendingOrders,
                'averageRating' => $seller->average_rating,
            ],
            'recentOrders'  => $recentOrders,
            'recentReviews' => $recentReviews,
            'revenueData'   => $revenueData,
        ]);
    }
}
