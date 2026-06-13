<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Buyer;
use App\Models\Favorite;
use App\Models\Product;
use App\Services\DemoProductService;

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

    public function store(Request $request, Product $product)
    {
        $buyer = $this->resolveBuyer($request);

        $exists = Favorite::where('buyer_id', $buyer->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($exists) {
            if ($request->wantsJson()) {
                return response()->json([
                    'is_favorited'   => true,
                    'wishlist_count' => $this->wishlistCount($buyer->id),
                    'message'        => 'Already in wishlist.',
                ]);
            }

            return back()->with('info', 'Already in your wishlist.');
        }

        Favorite::create([
            'buyer_id'   => $buyer->id,
            'product_id' => $product->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'is_favorited'   => true,
                'wishlist_count' => $this->wishlistCount($buyer->id),
                'message'        => 'Added to wishlist',
            ]);
        }

        return back()->with('success', 'Added to wishlist!');
    }

    public function destroyByProduct(Request $request, Product $product)
    {
        $buyer = $this->resolveBuyer($request);

        Favorite::where('buyer_id', $buyer->id)
            ->where('product_id', $product->id)
            ->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'is_favorited'   => false,
                'wishlist_count' => $this->wishlistCount($buyer->id),
                'message'        => 'Removed from wishlist',
            ]);
        }

        return back()->with('info', 'Removed from wishlist.');
    }

    public function toggleItem(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|integer|exists:products,id',
            'demo_slug'  => 'nullable|string',
        ]);

        if (! $request->product_id && ! $request->demo_slug) {
            return response()->json(['message' => 'Product is required.'], 422);
        }

        $buyer = $this->resolveBuyer($request);

        if ($request->filled('demo_slug')) {
            $demo = DemoProductService::findBySlug($request->demo_slug);

            if (! $demo) {
                return response()->json(['message' => 'Product not found.'], 404);
            }

            $product = DemoProductService::ensureDatabaseProduct($demo);
        } else {
            $product = Product::findOrFail($request->product_id);
        }

        $existing = Favorite::where('buyer_id', $buyer->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'is_favorited'   => false,
                'product_id'     => $product->id,
                'wishlist_count' => $this->wishlistCount($buyer->id),
                'message'        => 'Removed from wishlist',
            ]);
        }

        Favorite::create([
            'buyer_id'   => $buyer->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'is_favorited'   => true,
            'product_id'     => $product->id,
            'wishlist_count' => $this->wishlistCount($buyer->id),
            'message'        => 'Added to wishlist',
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

    private function resolveBuyer(Request $request): Buyer
    {
        return $request->user()->buyer ?? Buyer::create(['user_id' => $request->user()->id]);
    }

    private function wishlistCount(int $buyerId): int
    {
        return Favorite::where('buyer_id', $buyerId)->count();
    }
}
