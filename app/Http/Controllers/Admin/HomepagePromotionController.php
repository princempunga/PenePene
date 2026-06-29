<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepagePromotion;
use App\Models\Seller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomepagePromotionController extends Controller
{
    public function index()
    {
        $promotions = HomepagePromotion::with([
            'seller.user',
            'product.images',
            'product.category',
        ])
        ->orderBy('promotion_order')
        ->get();

        $sellers = Seller::with('user')
            ->active()
            ->orderBy('business_name')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'business_name' => $s->business_name,
                'user_name'     => $s->user?->name,
            ]);

        return Inertia::render('Admin/Promotions/Index', [
            'promotions' => $promotions,
            'sellers'    => $sellers,
        ]);
    }

    /**
     * Get products for a specific seller (AJAX).
     */
    public function sellerProducts(Seller $seller)
    {
        $products = Product::where('seller_id', $seller->id)
            ->where('status', 'active')
            ->with('images')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'price'     => $p->sale_price ?? $p->price,
                'currency'  => $p->currency,
                'image_url' => $p->images?->where('is_primary', true)->first()?->image_path
                            ?? $p->images?->first()?->image_path,
            ]);

        return response()->json(['products' => $products]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'seller_id'        => 'required|exists:sellers,id',
            'product_id'       => 'required|exists:products,id',
            'custom_image_url' => 'nullable|url',
            'headline'         => 'nullable|string|max:100',
            'promotion_order'  => 'required|integer|between:1,10',
            'is_active'        => 'boolean',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
        ]);

        // Only one promotion per order slot
        HomepagePromotion::where('promotion_order', $data['promotion_order'])->delete();

        $promotion = HomepagePromotion::create($data);

        return back()->with('success', 'Promotion created successfully.');
    }

    public function update(Request $request, HomepagePromotion $promotion)
    {
        $data = $request->validate([
            'seller_id'        => 'sometimes|exists:sellers,id',
            'product_id'       => 'sometimes|exists:products,id',
            'custom_image_url' => 'nullable|url',
            'headline'         => 'nullable|string|max:100',
            'promotion_order'  => 'sometimes|integer|between:1,10',
            'is_active'        => 'boolean',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
        ]);

        $promotion->update($data);

        return back()->with('success', 'Promotion updated successfully.');
    }

    public function destroy(HomepagePromotion $promotion)
    {
        $promotion->delete();
        return back()->with('success', 'Promotion removed.');
    }
}
