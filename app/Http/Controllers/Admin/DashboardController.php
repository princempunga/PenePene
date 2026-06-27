<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use App\Services\AdminDemoDataService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    use SimulatesData;

    public function index()
    {
        $stats = [
            'totalUsers'   => User::whereIn('role', ['buyer', 'seller'])->count(),
            'totalSellers' => Seller::where('status', 'verified')->count(),
            'totalOrders'  => Order::count(),
            'totalRevenue' => Order::whereIn('status', ['delivered'])->sum('total'),
        ];

        $pendingSellers = Seller::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $recentOrders = Order::with(['buyer.user', 'seller'])
            ->latest()
            ->take(5)
            ->get();

        $usingDemo = $this->adminDemoEnabled() && Order::count() === 0;

        if ($usingDemo) {
            $stats          = AdminDemoDataService::dashboardStats();
            $pendingSellers = AdminDemoDataService::pendingSellers();
            $recentOrders   = AdminDemoDataService::recentOrders();
        }

        return Inertia::render('Admin/Dashboard', [
            'stats'          => $stats,
            'pendingSellers' => $pendingSellers,
            'recentOrders'   => $recentOrders,
            'usingDemoData'  => $usingDemo,
        ]);
    }
}
