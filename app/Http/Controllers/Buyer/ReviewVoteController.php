<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewVoteController extends Controller
{
    public function store(Request $request, \App\Models\Review $review)
    {
        $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        $user = $request->user();

        // Check if user already voted
        $vote = \App\Models\ReviewVote::where('review_id', $review->id)
            ->where('user_id', $user->id)
            ->first();

        if ($vote) {
            // If they click the same vote again, maybe toggle/remove it?
            if ($vote->is_helpful === $request->boolean('is_helpful')) {
                $vote->delete();
                $review->decrement('helpful_votes');
                return back()->with('success', 'Vote removed.');
            } else {
                $vote->update(['is_helpful' => $request->boolean('is_helpful')]);
                // If it was not helpful and now is helpful, +1 helpful
                if ($request->boolean('is_helpful')) {
                    $review->increment('helpful_votes');
                } else {
                    $review->decrement('helpful_votes');
                }
                return back()->with('success', 'Vote updated.');
            }
        }

        // Create new vote
        \App\Models\ReviewVote::create([
            'review_id'  => $review->id,
            'user_id'    => $user->id,
            'is_helpful' => $request->boolean('is_helpful'),
        ]);

        if ($request->boolean('is_helpful')) {
            $review->increment('helpful_votes');
        }

        return back()->with('success', 'Vote submitted.');
    }
}
