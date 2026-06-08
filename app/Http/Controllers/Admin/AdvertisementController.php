<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SponsoredProduct;
use App\Models\Notification;

class AdvertisementController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'pending');

        $query = SponsoredProduct::with(['product', 'seller.user']);
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $advertisements = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Advertisements/Index', [
            'advertisements' => $advertisements,
            'filters'        => ['status' => $status],
        ]);
    }

    public function approve(Request $request, SponsoredProduct $sponsored)
    {
        $sponsored->update(['status' => 'active']);

        Notification::create([
            'user_id' => $sponsored->seller->user_id,
            'title'   => 'Sponsored Campaign Approved',
            'body'    => "Your sponsored campaign for \"{$sponsored->product->name}\" has been approved and is now live.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Sponsored product approved and is now live.');
    }

    public function reject(Request $request, SponsoredProduct $sponsored)
    {
        $sponsored->update(['status' => 'rejected']);

        Notification::create([
            'user_id' => $sponsored->seller->user_id,
            'title'   => 'Sponsored Campaign Rejected',
            'body'    => "Your sponsored campaign for \"{$sponsored->product->name}\" was rejected.",
            'type'    => 'system',
        ]);

        return back()->with('success', 'Sponsored product request rejected.');
    }
}
