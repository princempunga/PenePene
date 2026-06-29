<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\StatsDownloadRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatsDownloadRequestController extends Controller
{
    public function index()
    {
        $requests = StatsDownloadRequest::with(['seller.user', 'reviewer'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/StatsRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function approve(Request $request, StatsDownloadRequest $statsRequest)
    {
        if ($statsRequest->status !== StatsDownloadRequest::STATUS_PENDING) {
            return back()->withErrors(['status' => 'Cette demande a déjà été traitée.']);
        }

        $statsRequest->update([
            'status'      => StatsDownloadRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $statsRequest->generateDownloadToken();

        if ($statsRequest->seller?->user_id) {
            Notification::create([
                'user_id'    => $statsRequest->seller->user_id,
                'type'       => 'report',
                'title'      => 'Demande de rapport approuvée',
                'body'       => 'Votre demande de téléchargement de statistiques a été acceptée. Vous pouvez maintenant télécharger votre rapport.',
                'action_url' => '/seller/reports',
            ]);
        }

        return back()->with('success', 'Demande approuvée. Le vendeur peut maintenant télécharger son rapport.');
    }

    public function reject(Request $request, StatsDownloadRequest $statsRequest)
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        if ($statsRequest->status !== StatsDownloadRequest::STATUS_PENDING) {
            return back()->withErrors(['status' => 'Cette demande a déjà été traitée.']);
        }

        $statsRequest->update([
            'status'           => StatsDownloadRequest::STATUS_REJECTED,
            'reviewed_by'      => $request->user()->id,
            'reviewed_at'      => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        if ($statsRequest->seller?->user_id) {
            Notification::create([
                'user_id'    => $statsRequest->seller->user_id,
                'type'       => 'report',
                'title'      => 'Demande de rapport refusée',
                'body'       => $request->rejection_reason
                    ? "Votre demande a été refusée : {$request->rejection_reason}"
                    : 'Votre demande de téléchargement de statistiques a été refusée.',
                'action_url' => '/seller/reports',
            ]);
        }

        return back()->with('success', 'Demande refusée.');
    }
}
