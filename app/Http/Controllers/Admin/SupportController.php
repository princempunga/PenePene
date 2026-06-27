<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupportController extends Controller
{
    use SimulatesData;

    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->latest()->paginate(20)->withQueryString();
        $admins  = User::whereIn('role', ['admin', 'super_admin'])->get(['id', 'name']);

        [$tickets, $usingDemo] = $this->demoPageOr(
            $tickets,
            AdminDemoDataService::supportTickets($request->status, $request->priority),
            20
        );

        if ($usingDemo && $admins->isEmpty()) {
            $admins = collect(AdminDemoDataService::supportAdmins());
        }

        return Inertia::render('Admin/Support/Index', [
            'tickets'       => $tickets,
            'admins'        => $admins,
            'filters'       => $request->only('status', 'priority'),
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function show(SupportTicket $ticket)
    {
        $ticket->load(['user', 'replies.user', 'assignedTo']);
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get(['id', 'name']);

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket,
            'admins' => $admins,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate(['body' => 'required|string|max:5000']);

        $ticket->replies()->create([
            'user_id'        => Auth::id(),
            'body'           => $request->body,
            'is_staff_reply' => true,
        ]);

        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Reply sent to user.');
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $request->validate(['status' => 'required|in:open,in_progress,resolved,closed']);

        $updates = ['status' => $request->status];
        if ($request->status === 'resolved') {
            $updates['resolved_at'] = now();
        } elseif ($request->status === 'closed') {
            $updates['closed_at'] = now();
        }

        $ticket->update($updates);

        return back()->with('success', 'Ticket status updated.');
    }

    public function assign(Request $request, SupportTicket $ticket)
    {
        $request->validate(['assigned_to' => 'nullable|exists:users,id']);

        $ticket->update(['assigned_to' => $request->assigned_to]);

        return back()->with('success', 'Ticket assigned.');
    }
}
