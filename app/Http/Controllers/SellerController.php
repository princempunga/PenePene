<?php

namespace App\Http\Controllers;

use App\Services\DemoSimulationService;
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

        $isDemoStore = DemoSimulationService::isDemoSeller($seller);

        if ($isDemoStore) {
            DemoSimulationService::syncStoreProducts($seller);
        }

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

        if ($isDemoStore && $reviews->isEmpty()) {
            $reviews = collect(DemoSimulationService::demoReviews());
        }

        if ($isDemoStore) {
            DemoSimulationService::applyOnlineStatus($seller->user, $seller);
            $seller->total_reviews = max($seller->total_reviews, count(DemoSimulationService::demoReviews()));
        } else {
            $seller->user->last_seen_text = $seller->user->getLastSeenText();
        }

        return Inertia::render('Sellers/Store', [
            'seller'   => $seller,
            'products' => $products,
            'reviews'  => $reviews,
        ]);
    }
}
