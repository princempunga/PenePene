<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Review;

class ReviewModerationController extends Controller
{
    public function index(Request $request)
    {
        $reviews = Review::with(['buyer.user', 'seller', 'order'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Reviews/Index', ['reviews' => $reviews]);
    }

    public function destroy(Review $review)
    {
        $review->delete();

        // Recalculate seller stats
        $seller = $review->seller;
        $avg = Review::where('seller_id', $seller->id)->avg('rating') ?? 0;
        $count = Review::where('seller_id', $seller->id)->count();
        $seller->update(['average_rating' => $avg, 'total_reviews' => $count]);

        return back()->with('success', 'Review removed from the platform.');
    }
}
