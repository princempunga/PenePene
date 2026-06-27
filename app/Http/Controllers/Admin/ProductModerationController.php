<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Product;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductModerationController extends Controller
{
    use SimulatesData;

    public function index(Request $request)
    {
        $query = Product::with(['seller', 'category'])->withTrashed(false);

        $status = $request->get('status', 'pending');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $products = $query->latest()->paginate(20)->withQueryString();

        [$products, $usingDemo] = $this->demoPageOr(
            $products,
            AdminDemoDataService::products($status),
            20
        );

        return Inertia::render('Admin/Products/Index', [
            'products'      => $products,
            'filters'       => ['status' => $status],
            'usingDemoData' => $usingDemo,
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
