<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Seller;
use App\Models\Notification;

class SellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Seller::with('user')->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $status = $request->status;
            if (in_array($status, ['verified', 'active'])) {
                $query->whereIn('status', ['verified', 'active']);
            } else {
                $query->where('status', $status);
            }
        }

        $sellers = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => $sellers,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(Seller $seller)
    {
        $seller->load(['user', 'activeSubscription.plan', 'products' => function ($q) {
            $q->with(['category', 'images'])->latest();
        }]);
        
        return Inertia::render('Admin/Sellers/Show', [
            'seller' => $seller,
        ]);
    }

    public function verify(Request $request, Seller $seller)
    {
        $seller->update([
            'status'      => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);

        Notification::create([
            'user_id'    => $seller->user_id,
            'title'      => 'Account Verified',
            'body'       => 'Congratulations! Your seller account has been verified. Your store is now live.',
            'type'       => 'system',
            'action_url' => '/seller/dashboard',
        ]);

        return back()->with('success', 'Seller has been verified successfully.');
    }

    public function reject(Request $request, Seller $seller)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $seller->update([
            'status'      => 'rejected',
            'verified_at' => null,
            'verified_by' => null,
        ]);

        Notification::create([
            'user_id' => $seller->user_id,
            'title'   => 'Verification Rejected',
            'body'    => 'Your seller application was rejected. Reason: ' . $request->reason,
            'type'    => 'system',
        ]);

        return back()->with('success', 'Seller application rejected.');
    }

    public function updateStatus(Request $request, Seller $seller)
    {
        $request->validate([
            'status' => 'required|in:verified,suspended',
        ]);

        $status = $request->status === 'active' ? 'verified' : $request->status;

        $seller->update([
            'status' => $status,
        ]);

        return back()->with('success', 'Seller status updated.');
    }

    public function quickAction(Request $request, Seller $seller)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,suspend,activate',
        ]);

        $action = $request->action;

        switch ($action) {
            case 'approve':
                $seller->update([
                    'status'      => 'verified',
                    'verified_at' => now(),
                    'verified_by' => $request->user()->id,
                ]);
                Notification::create([
                    'user_id'    => $seller->user_id,
                    'title'      => 'Account Verified',
                    'body'       => 'Congratulations! Your seller account has been verified. Your store is now live.',
                    'type'       => 'system',
                    'action_url' => '/seller/dashboard',
                ]);
                return back()->with('success', 'Seller approved successfully.');
            case 'reject':
                $seller->update([
                    'status'      => 'rejected',
                    'verified_at' => null,
                    'verified_by' => null,
                ]);
                Notification::create([
                    'user_id' => $seller->user_id,
                    'title'   => 'Verification Rejected',
                    'body'    => 'Your seller application was rejected.',
                    'type'    => 'system',
                ]);
                return back()->with('success', 'Seller rejected.');
            case 'suspend':
                $seller->update(['status' => 'suspended']);
                $seller->products()->where('status', 'active')->update(['status' => 'inactive']);
                return back()->with('success', 'Seller suspended and products hidden.');
            case 'activate':
                $seller->update(['status' => 'verified']);
                return back()->with('success', 'Seller activated.');
        }
    }

    public function toggleStatus(Request $request, Seller $seller)
    {
        $newStatus = $seller->status === 'suspended' ? 'verified' : 'suspended';

        $seller->update(['status' => $newStatus]);

        if ($newStatus === 'suspended') {
            $seller->products()->where('status', 'active')->update(['status' => 'inactive']);
        }

        $label = $newStatus === 'suspended' ? 'suspended' : 'activated';
        return back()->with('success', "Seller {$label} successfully.");
    }

    /**
     * Bulk action: block or unblock multiple sellers.
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:sellers,id',
            'action' => 'required|in:suspend,activate',
        ]);

        $sellers = Seller::whereIn('id', $request->ids)->get();

        foreach ($sellers as $seller) {
            if ($request->action === 'suspend') {
                $seller->update(['status' => 'suspended']);
                // Cascade: hide all active products
                $seller->products()->where('status', 'active')->update(['status' => 'inactive']);
            } else {
                $seller->update(['status' => 'verified']);
            }
        }

        $count  = $sellers->count();
        $label  = $request->action === 'suspend' ? 'suspended' : 'activated';
        return back()->with('success', "{$count} seller(s) {$label} successfully.");
    }

    /**
     * Detailed seller profile with sales statistics.
     */
    public function statistics(Seller $seller, Request $request)
    {
        $seller->load(['user', 'activeSubscription.plan']);

        // Orders for this seller
        $orderQuery = $seller->orders()
            ->with(['items.product.category', 'buyer.user'])
            ->latest();

        if ($request->filled('order_status') && $request->order_status !== 'all') {
            $orderQuery->where('status', $request->order_status);
        }

        $orders = $orderQuery->paginate(15)->withQueryString();

        $allOrders = $seller->orders()->latest()->get();
        $totalRevenue = $allOrders->whereIn('status', ['delivered'])->sum('total');
        $totalOrders  = $allOrders->count();

        // Product status filter for product list
        $productStatus = $request->get('product_status', 'all');
        $productQuery = $seller->products()->with(['category', 'images']);
        if ($productStatus !== 'all') {
            $productQuery->where('status', $productStatus);
        }
        $filteredProducts = $productQuery->get();

        // Top and bottom selling products (by confirmed_sales)
        $allProducts = $seller->products()->with(['category', 'images'])->get();

        $topProducts    = $allProducts->sortByDesc('confirmed_sales')->take(5)->values();
        $bottomProducts = $allProducts->sortBy('confirmed_sales')->take(5)->values();

        // Top-selling products breakdown by category and subcategory
        $byCategory = $allProducts
            ->groupBy(fn ($p) => $p->category->name ?? 'Sans catégorie')
            ->map(function ($group) {
                $subcategories = $group
                    ->groupBy(fn ($p) => $p->subcategory->name ?? 'Sans sous-catégorie')
                    ->map(function ($subGroup) {
                        return [
                            'name'      => $subGroup->first()->subcategory->name ?? 'Sans sous-catégorie',
                            'products'  => $subGroup->count(),
                            'sales'     => $subGroup->sum('confirmed_sales'),
                            'revenue'   => $subGroup->sum(fn ($p) => $p->price * $p->confirmed_sales),
                            'items'     => $subGroup->map(fn ($p) => [
                                'id'          => $p->id,
                                'name'        => $p->name,
                                'price'       => (float) $p->price,
                                'sales'       => (int) $p->confirmed_sales,
                                'stock'       => (int) ($p->initial_stock - $p->confirmed_sales),
                                'status'      => $p->status,
                                'image'       => $p->images->first()?->image_path,
                                'slug'        => $p->slug,
                            ])->values(),
                        ];
                    })
                    ->sortByDesc('sales')
                    ->values();

                return [
                    'name'            => $group->first()->category->name ?? 'Sans catégorie',
                    'products'        => $group->count(),
                    'sales'           => $group->sum('confirmed_sales'),
                    'revenue'         => $group->sum(fn ($p) => $p->price * $p->confirmed_sales),
                    'subcategories'   => $subcategories,
                ];
            })
            ->sortByDesc('sales')
            ->values();

        return Inertia::render('Admin/Sellers/Statistics', [
            'seller'         => $seller,
            'orders'         => $orders,
            'orderFilters'   => $request->only('order_status'),
            'totalRevenue'   => $totalRevenue,
            'totalOrders'    => $totalOrders,
            'totalProducts'  => $allProducts->count(),
            'topProducts'    => $topProducts,
            'bottomProducts' => $bottomProducts,
            'byCategory'     => $byCategory,
            'productStatus'  => $productStatus,
            'filteredProducts' => $filteredProducts,
        ]);
    }
}
