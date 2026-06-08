<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Favorite;
use App\Models\Product;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $buyer = $request->user()->buyer;

        $favorites = Favorite::with(['product.images', 'product.seller', 'product.category'])
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->paginate(12);

        return Inertia::render('Buyer/Wishlist', [
            'favorites' => $favorites,
        ]);
    }

    public function toggle(Request $request, Product $product)
    {
        $buyer = $request->user()->buyer;

        $existing = Favorite::where('buyer_id', $buyer->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('info', 'Removed from wishlist.');
        }

        Favorite::create([
            'buyer_id'   => $buyer->id,
            'product_id' => $product->id,
        ]);

        return back()->with('success', 'Added to wishlist!');
    }

    public function destroy(Request $request, Favorite $favorite)
    {
        $buyer = $request->user()->buyer;

        if ($favorite->buyer_id !== $buyer->id) {
            abort(403);
        }

        $favorite->delete();

        return back()->with('info', 'Removed from wishlist.');
    }
}
