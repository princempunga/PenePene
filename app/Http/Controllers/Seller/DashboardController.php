<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Conversation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $seller = $user->seller;
        $sellerId = $seller->id;

        $totalProducts = Product::where('seller_id', $sellerId)->count();
        $totalOrders   = Order::where('seller_id', $sellerId)->count();
        $totalRevenue  = Order::where('seller_id', $sellerId)
            ->where('status', 'delivered')
            ->sum('total');

        $pendingOrders = Order::where('seller_id', $sellerId)
            ->where('status', 'pending')
            ->count();

        $lowStockProducts = Product::where('seller_id', $sellerId)
            ->whereRaw('(initial_stock - confirmed_sales) > 0')
            ->whereRaw('(initial_stock - confirmed_sales) <= low_stock_threshold')
            ->count();

        $pendingProducts = Product::where('seller_id', $sellerId)
            ->where('status', 'pending')
            ->count();

        $ordersThisWeek = Order::where('seller_id', $sellerId)
            ->where('created_at', '>=', Carbon::now()->startOfWeek())
            ->count();

        $revenueThisWeek = Order::where('seller_id', $sellerId)
            ->where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->startOfWeek())
            ->sum('total');

        $unreadMessages = Message::whereHas('conversation', fn ($q) => $q->where('seller_id', $sellerId))
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();

        // CRM conversation stats (new B2B model)
        $activeInquiries   = Conversation::where('seller_id', $sellerId)->where('status', 'inquiry')->count();
        $negotiating       = Conversation::where('seller_id', $sellerId)->where('status', 'negotiating')->count();
        $dealsConfirmed    = Conversation::where('seller_id', $sellerId)->where('status', 'confirmed')->count();
        $dealsSold         = Conversation::where('seller_id', $sellerId)->where('status', 'sold')->count();

        $recentOrders = Order::with(['buyer.user', 'items'])
            ->where('seller_id', $sellerId)
            ->latest()
            ->take(5)
            ->get();

        $recentReviews = Review::with('buyer.user')
            ->where('seller_id', $sellerId)
            ->where('is_approved', true)
            ->latest()
            ->take(3)
            ->get();

        $revenueData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $sum  = Order::where('seller_id', $sellerId)
                ->where('status', 'delivered')
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->sum('total');

            $revenueData[] = [
                'date'   => $date->locale('fr')->translatedFormat('j M'),
                'amount' => (float) $sum,
            ];
        }

        return Inertia::render('Seller/Dashboard', [
            'seller' => $seller->only([
                'id', 'business_name', 'status', 'average_rating', 'total_reviews', 'slug',
            ]),
            'stats' => [
                'totalProducts'    => $totalProducts,
                'totalOrders'      => $totalOrders,
                'totalRevenue'     => (float) $totalRevenue,
                'pendingOrders'    => $pendingOrders,
                'lowStockProducts' => $lowStockProducts,
                'pendingProducts'  => $pendingProducts,
                'averageRating'    => (float) ($seller->average_rating ?? 0),
                'ordersThisWeek'   => $ordersThisWeek,
                'revenueThisWeek'  => (float) $revenueThisWeek,
                'unreadMessages'   => $unreadMessages,
                'currency'         => 'CDF',
                'activeInquiries'  => $activeInquiries,
                'negotiating'      => $negotiating,
                'dealsConfirmed'   => $dealsConfirmed,
                'dealsSold'        => $dealsSold,
            ],
            'recentOrders'  => $recentOrders,
            'recentReviews' => $recentReviews,
            'revenueData'   => $revenueData,
        ]);
    }
}
