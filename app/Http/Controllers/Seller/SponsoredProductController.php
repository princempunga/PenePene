<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SponsoredProduct;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class SponsoredProductController extends Controller
{
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index()
    {
        $sponsored = SponsoredProduct::with('product')
            ->where('seller_id', $this->seller()->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Seller/Sponsored/Index', ['sponsored' => $sponsored]);
    }

    public function create()
    {
        $products = Product::where('seller_id', $this->seller()->id)
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('Seller/Sponsored/Create', ['products' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id'  => 'required|exists:products,id',
            'placement'   => 'required|in:homepage_banner,product_of_day,product_of_week,featured_listing,category_top',
            'starts_at'   => 'required|date|after:today',
            'expires_at'  => 'required|date|after:starts_at',
        ]);

        // Verify product belongs to this seller
        $product = Product::where('id', $request->product_id)
            ->where('seller_id', $this->seller()->id)
            ->firstOrFail();

        SponsoredProduct::create([
            'product_id'  => $product->id,
            'seller_id'   => $this->seller()->id,
            'placement'   => $request->placement,
            'starts_at'   => $request->starts_at,
            'expires_at'  => $request->expires_at,
            'amount_paid' => 0, // V1: admin sets price, not auto-charged
            'status'      => 'pending', // Admin must approve
        ]);

        return redirect()->route('seller.sponsored.index')
            ->with('success', 'Your sponsored product request has been submitted for admin review.');
    }

    public function destroy(SponsoredProduct $sponsored)
    {
        if ($sponsored->seller_id !== $this->seller()->id) {
            abort(403);
        }

        if ($sponsored->status === 'active') {
            return back()->withErrors(['error' => 'Cannot cancel an active sponsored campaign.']);
        }

        $sponsored->delete();

        return back()->with('success', 'Sponsored product request removed.');
    }
}
