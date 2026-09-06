<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Seller;

class SellerController extends Controller
{
    public function publicStore(\Illuminate\Http\Request $request, Seller $seller)
    {
        if (in_array($seller->status, ['rejected', 'banned', 'suspended', 'blocked'])) {
            abort(404);
        }

        $seller->load('user');
        $seller->increment('total_views');

        // Mode "all" : liste complète pour le filtrage instantané côté client
        if ($request->boolean('all')) {
            $all = $seller->products()
                ->with(['images', 'category'])
                ->active()
                ->latest()
                ->get();

            return Inertia::render('Sellers/Store', [
                'seller'   => $seller,
                'products' => ['data' => $all, 'total' => $all->count(), 'links' => []],
            ]);
        }

        $products = $seller->products()
            ->with(['images', 'category'])
            ->active()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $reviews = $seller->reviews()
            ->with('buyer.user')
            ->approved()
            ->latest()
            ->take(5)
            ->get();

        $seller->user->last_seen_text = $seller->user->getLastSeenText();

        return Inertia::render('Sellers/Store', [
            'seller'   => $seller,
            'products' => $products,
            'reviews'  => $reviews,
        ]);
    }
}
