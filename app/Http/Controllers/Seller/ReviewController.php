<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Review::with(['buyer.user', 'product', 'conversation'])
            ->where('seller_id', $seller->id);

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
        }

        $reviews = $query->latest()->paginate(15)->withQueryString();

        $breakdown = Review::where('seller_id', $seller->id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->all();

        return Inertia::render('Seller/Reviews/Index', [
            'reviews' => $reviews,
            'summary' => [
                'average_rating' => $seller->average_rating,
                'total_reviews'  => $seller->total_reviews,
                'breakdown'      => $breakdown,
            ],
            'filters' => $request->only(['rating']),
        ]);
    }

    public function reply(Request $request, Review $review)
    {
        $seller = $request->user()->seller;

        if ($review->seller_id !== $seller->id) {
            abort(403);
        }

        $request->validate([
            'seller_reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'seller_reply' => $request->seller_reply,
            'replied_at'   => now(),
        ]);

        return back()->with('success', 'Reply posted successfully.');
    }
}
