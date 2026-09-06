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
        $query = Product::with(['seller', 'category', 'images'])->withTrashed(false);

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

    /**
     * Block a product due to illegal / policy-violating sales.
     * Sets status to 'blocked' and notifies the seller with the given reason.
     */
    public function block(Request $request, Product $product)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $reason = $request->reason ?: 'violation of platform policies';

        $product->update(['status' => 'blocked']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Blocked',
            'body'    => "Your product \"{$product->name}\" has been blocked due to {$reason}. If you believe this is an error, please contact support.",
            'type'    => 'system',
        ]);

        return back()->with('success', "Product \"{$product->name}\" has been blocked due to {$reason}.");
    }

    /**
     * Unblock a previously blocked product.
     */
    public function unblock(Request $request, Product $product)
    {
        $product->update(['status' => 'inactive']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Unblocked',
            'body'    => "Your product \"{$product->name}\" has been unblocked by an administrator. You may re-submit it for review.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Product unblocked successfully.');
    }

    /**
     * Bulk block or unblock products (admin action).
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:products,id',
            'action' => 'required|in:block,unblock',
        ]);

        $newStatus = $request->action === 'block' ? 'inactive' : 'active';

        Product::whereIn('id', $request->ids)->update(['status' => $newStatus]);

        $count = count($request->ids);
        $label = $request->action === 'block' ? 'blocked' : 'unblocked';

        return back()->with('success', "{$count} product(s) {$label} successfully.");
    }

    public function activate(Request $request, Product $product)
    {
        $product->update(['status' => 'active']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Activated',
            'body'    => "Your product \"{$product->name}\" has been activated by an administrator and is now visible on the marketplace.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Product activated successfully.');
    }

    public function deactivate(Request $request, Product $product)
    {
        $product->update(['status' => 'inactive']);

        Notification::create([
            'user_id' => $product->seller->user_id,
            'title'   => 'Product Deactivated',
            'body'    => "Your product \"{$product->name}\" has been deactivated by an administrator and is no longer visible on the marketplace.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Product deactivated successfully.');
    }
}
