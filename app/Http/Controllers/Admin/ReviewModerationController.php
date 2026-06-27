<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewModerationController extends Controller
{
    use SimulatesData;

    public function index(Request $request)
    {
        $reviews = Review::with(['buyer.user', 'seller', 'order'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        [$reviews, $usingDemo] = $this->demoPageOr(
            $reviews,
            AdminDemoDataService::reviews(),
            20
        );

        return Inertia::render('Admin/Reviews/Index', [
            'reviews'       => $reviews,
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function destroy(Review $review)
    {
        $review->delete();

        $seller = $review->seller;
        $avg = Review::where('seller_id', $seller->id)->avg('rating') ?? 0;
        $count = Review::where('seller_id', $seller->id)->count();
        $seller->update(['average_rating' => $avg, 'total_reviews' => $count]);

        return back()->with('success', 'Review removed from the platform.');
    }
}
