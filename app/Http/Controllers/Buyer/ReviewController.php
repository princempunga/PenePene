<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Review;
use App\Models\Order;
use App\Models\Seller;

class ReviewController extends Controller
{
    public function create(Request $request, Order $order)
    {
        $buyer = $request->user()->buyer;

        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        // Check order is delivered
        if ($order->status !== 'delivered') {
            return back()->withErrors(['order' => 'You can only review delivered orders.']);
        }

        $order->load('seller.user', 'items.product');

        return Inertia::render('Buyer/Reviews/Create', [
            'order' => $order,
        ]);
    }

    public function store(Request $request, Order $order)
    {
        $buyer = $request->user()->buyer;

        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        $request->validate([
            'seller_rating'  => 'required|integer|min:1|max:5',
            'seller_comment' => 'nullable|string|max:1000',
            'product_ratings' => 'nullable|array',
            'product_ratings.*.product_id' => 'exists:products,id',
            'product_ratings.*.rating' => 'integer|min:1|max:5',
            'product_ratings.*.comment' => 'nullable|string|max:500',
        ]);

        // Seller review
        $sellerReview = Review::updateOrCreate(
            [
                'buyer_id'     => $buyer->id,
                'seller_id'    => $order->seller_id,
                'reviewable_type' => 'seller',
            ],
            [
                'rating'  => $request->seller_rating,
                'comment' => $request->seller_comment,
                'status'  => 'approved',
            ]
        );

        // Update seller aggregate rating
        $seller = Seller::find($order->seller_id);
        $avg = Review::where('seller_id', $seller->id)
            ->where('reviewable_type', 'seller')
            ->where('status', 'approved')
            ->avg('rating');
        $count = Review::where('seller_id', $seller->id)
            ->where('reviewable_type', 'seller')
            ->where('status', 'approved')
            ->count();

        $seller->update([
            'average_rating' => round($avg, 2),
            'total_reviews'  => $count,
        ]);

        return redirect()->route('buyer.orders.show', $order)
            ->with('success', 'Review submitted successfully!');
    }

    public function index(Request $request)
    {
        $buyer = $request->user()->buyer;

        $reviews = Review::with('seller.user')
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Buyer/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }
}
