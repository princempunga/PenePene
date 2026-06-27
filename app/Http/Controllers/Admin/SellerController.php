<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Seller;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SellerController extends Controller
{
    use SimulatesData;

    public function index(Request $request)
    {
        $query = Seller::with('user')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $sellers = $query->paginate(15)->withQueryString();

        [$sellers, $usingDemo] = $this->demoPageOr(
            $sellers,
            AdminDemoDataService::sellers($request->status),
            15
        );

        return Inertia::render('Admin/Sellers/Index', [
            'sellers'       => $sellers,
            'filters'       => $request->only('status'),
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function show(Seller $seller)
    {
        $seller->load(['user', 'plan']);

        return Inertia::render('Admin/Sellers/Show', [
            'seller' => $seller,
        ]);
    }

    public function verify(Request $request, Seller $seller)
    {
        $seller->update([
            'status'      => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);

        Notification::create([
            'user_id'    => $seller->user_id,
            'title'      => 'Account Verified',
            'body'       => 'Congratulations! Your seller account has been verified. Your store is now live.',
            'type'       => 'system',
            'action_url' => '/seller/dashboard',
        ]);

        return back()->with('success', 'Seller has been verified successfully.');
    }

    public function reject(Request $request, Seller $seller)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $seller->update([
            'status'      => 'rejected',
            'verified_at' => null,
            'verified_by' => null,
        ]);

        Notification::create([
            'user_id' => $seller->user_id,
            'title'   => 'Verification Rejected',
            'body'    => 'Your seller application was rejected. Reason: ' . $request->reason,
            'type'    => 'system',
        ]);

        return back()->with('success', 'Seller application rejected.');
    }

    public function updateStatus(Request $request, Seller $seller)
    {
        $request->validate([
            'status' => 'required|in:active,suspended',
        ]);

        $seller->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Seller status updated.');
    }
}
