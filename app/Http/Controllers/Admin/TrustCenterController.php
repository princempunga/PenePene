<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\SellerSuspended;

class TrustCenterController extends Controller
{
    public function index(Request $request)
    {
        $reports = \App\Models\SellerReport::with(['reporter', 'reportedSeller'])
            ->latest()
            ->paginate(15);

        // Analytics
        $stats = [
            'total_reports' => \App\Models\SellerReport::count(),
            'open_cases'    => \App\Models\SellerReport::whereIn('status', ['pending', 'investigating'])->count(),
            'resolved'      => \App\Models\SellerReport::where('status', 'resolved')->count(),
            'suspended'     => \App\Models\Seller::where('strikes', '>=', 3)->count(),
        ];

        return Inertia::render('Admin/TrustCenter/Index', [
            'reports' => $reports,
            'stats'   => $stats,
        ]);
    }

    public function show(\App\Models\SellerReport $report)
    {
        $report->load(['reporter', 'reportedSeller.user', 'reportedSeller.reports', 'resolvedBy']);

        return Inertia::render('Admin/TrustCenter/Show', [
            'report' => $report,
        ]);
    }

    public function updateStatus(Request $request, \App\Models\SellerReport $report)
    {
        $request->validate([
            'status' => 'required|in:pending,investigating,resolved,rejected,seller_suspended',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $report->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'resolved_at' => in_array($request->status, ['resolved', 'rejected', 'seller_suspended']) ? now() : null,
            'resolved_by' => in_array($request->status, ['resolved', 'rejected', 'seller_suspended']) ? $request->user()->id : null,
        ]);

        return back()->with('success', 'Report status updated.');
    }

    public function issueStrike(Request $request, \App\Models\Seller $seller)
    {
        $seller->increment('strikes');
        
        $seller->update([
            'trust_score' => max(0, $seller->trust_score - 20) // Deduct 20 points per strike
        ]);

        if ($seller->strikes >= 3) {
            $seller->update(['status' => 'suspended']);
            if ($seller->user) {
                $seller->user->notify(new SellerSuspended('Accumulation de 3 avertissements pour violations des règles.'));
            }
        }

        return back()->with('success', 'Strike issued to seller.');
    }
}
