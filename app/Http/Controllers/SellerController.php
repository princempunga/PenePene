<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Seller;

class SellerController extends Controller
{
    public function publicStore(Seller $seller)
    {
        if ($seller->status !== 'verified') {
            abort(404);
        }

        $seller->load('user');
        $seller->increment('total_views');

        $products = $seller->products()
            ->with(['images', 'category'])
            ->active()
            ->latest()
            ->paginate(12);

        $reviews = $seller->reviews()
            ->with('buyer.user')
            ->approved()
            ->latest()
            ->take(5)
            ->get();

        // Append the helper method result to the user
        $seller->user->last_seen_text = $seller->user->getLastSeenText();

        return Inertia::render('Sellers/Store', [
            'seller' => $seller,
            'products' => $products,
            'reviews' => $reviews,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }
}
