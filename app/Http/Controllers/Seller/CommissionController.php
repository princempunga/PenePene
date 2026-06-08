<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Commission;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Commission::with('order')
            ->where('seller_id', $seller->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $commissions = $query->latest()->paginate(15)->withQueryString();

        $base = Commission::where('seller_id', $seller->id);

        return Inertia::render('Seller/Commissions/Index', [
            'commissions' => $commissions,
            'summary'     => [
                'total_order_amount'  => (clone $base)->sum('order_amount'),
                'total_commission'    => (clone $base)->sum('commission_amount'),
                'total_seller_payout' => (clone $base)->sum('seller_payout'),
                'confirmed_payout'    => (clone $base)->where('status', 'confirmed')->sum('seller_payout'),
                'paid_payout'         => (clone $base)->where('status', 'paid')->sum('seller_payout'),
                'currency'            => 'TZS',
            ],
            'filters' => $request->only(['status']),
        ]);
    }
}
