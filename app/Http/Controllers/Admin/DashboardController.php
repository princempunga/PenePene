<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Seller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Global Platform Stats
        $stats = [
            'totalUsers'   => User::whereIn('role', ['buyer'])->count(),
            'totalSellers' => Seller::where('is_verified', true)->count(),
            'totalOrders'  => Order::count(),
            'totalRevenue' => Order::whereIn('payment_status', ['paid', 'completed'])->sum('total_amount'),
        ];

        // Pending verifications
        $pendingSellers = Seller::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        // Recent Activity
        $recentOrders = Order::with(['buyer.user', 'seller'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats'          => $stats,
            'pendingSellers' => $pendingSellers,
            'recentOrders'   => $recentOrders,
        ]);
    }
}
