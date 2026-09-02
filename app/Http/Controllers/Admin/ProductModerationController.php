<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Notification;
use App\Models\Seller;
use Carbon\Carbon;

class ProductModerationController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['seller', 'category'])->withTrashed(false);

        $status = $request->get('status', 'all');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Search by seller name
        if ($request->filled('search')) {
            $query->whereHas('seller', function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%');
            });
        }

        // Date filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sort = $request->get('sort');
        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sort === 'stock_asc') {
            $query->orderBy('initial_stock', 'asc')->orderBy('confirmed_sales', 'asc');
        } elseif ($sort === 'stock_desc') {
            $query->orderBy('initial_stock', 'desc')->orderBy('confirmed_sales', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters'  => [
                'status' => $status,
                'search' => $request->search,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['seller', 'category', 'images']);

        return Inertia::render('Admin/Products/Show', ['product' => $product]);
    }

    public function approve(Request $request, Product $product)
    {
        $product->update(['status' => 'active']);

        Notification::create([
            'user_id'    => $product->seller->user_id,
            'title'      => 'Product Approved',
            'body'       => "Your product \"{$product->name}\" has been approved and is now live on the marketplace.",
            'type'       => 'system',
            'action_url' => "/seller/products/{$product->id}/edit",
        ]);

        return back()->with('success', 'Product approved and is now live.');
    }

    public function reject(Request $request, Product $product)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $product->update(['status' => 'rejected']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Rejected',
            'body'    => "Your product \"{$product->name}\" was rejected. Reason: {$request->reason}",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Product rejected and seller notified.');
    }

    public function ban(Request $request, Product $product)
    {
        $product->update(['status' => 'inactive']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Removed',
            'body'    => "Your product \"{$product->name}\" has been removed from the marketplace for violating our terms of service.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Product banned from the marketplace.');
    }
}
