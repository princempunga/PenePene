<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $unread = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->latest()
            ->get();

        $read = Notification::where('user_id', $userId)
            ->where('is_read', true)
            ->latest()
            ->paginate(15);

        return Inertia::render('Seller/Notifications', [
            'unread' => $unread,
            'read'   => $read,
        ]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        if ($notification->action_url) {
            return redirect($notification->action_url);
        }

        return back();
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }
}
