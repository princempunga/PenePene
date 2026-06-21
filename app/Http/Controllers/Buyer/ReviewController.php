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
    public function create(Request $request, \App\Models\Conversation $conversation)
    {
        $buyer = $request->user()->buyer;

        if ($conversation->buyer_id !== $buyer->id) {
            abort(403);
        }

        // Check conversation status is Confirmed or Sold
        if (!in_array($conversation->status, ['confirmed', 'sold'])) {
            return back()->withErrors(['error' => 'You can only review after the deal is confirmed or sold.']);
        }

        $conversation->load('seller.user', 'product');

        return Inertia::render('Buyer/Reviews/Create', [
            'conversation' => $conversation,
        ]);
    }

    public function store(Request $request, \App\Models\Conversation $conversation)
    {
        $buyer = $request->user()->buyer;

        if ($conversation->buyer_id !== $buyer->id) {
            abort(403);
        }

        if (!in_array($conversation->status, ['confirmed', 'sold'])) {
            return back()->withErrors(['error' => 'You can only review after the deal is confirmed or sold.']);
        }

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'title'   => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
            'media.*' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov|max:10240', // max 10MB
        ]);

        $mediaPaths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $mediaPaths[] = $file->store('reviews/media', 'public');
            }
        }

        $review = Review::updateOrCreate(
            [
                'buyer_id'        => $buyer->id,
                'conversation_id' => $conversation->id,
            ],
            [
                'seller_id'   => $conversation->seller_id,
                'product_id'  => $conversation->product_id,
                'rating'      => $request->rating,
                'title'       => $request->title,
                'comment'     => $request->comment,
                'media'       => $mediaPaths,
                'is_approved' => true, // Auto approve or require admin? Auto for now.
            ]
        );

        // Update seller aggregate rating
        $seller = Seller::find($conversation->seller_id);
        $avg = Review::where('seller_id', $seller->id)
            ->where('is_approved', true)
            ->avg('rating');
        $count = Review::where('seller_id', $seller->id)
            ->where('is_approved', true)
            ->count();

        $seller->update([
            'average_rating' => round($avg, 2),
            'total_reviews'  => $count,
        ]);

        return redirect()->route('buyer.conversations.show', $conversation->id)
            ->with('success', 'Review submitted successfully!');
    }

    public function index(Request $request)
    {
        $buyer = $request->user()->buyer;

        $reviews = Review::with('seller.user', 'product', 'conversation')
            ->where('buyer_id', $buyer->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Buyer/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }
}
