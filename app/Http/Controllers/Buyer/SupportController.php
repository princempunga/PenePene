<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SupportTicket;
use Illuminate\Support\Facades\Auth;

class SupportController extends Controller
{
    public function index()
    {
        $tickets = SupportTicket::with(['replies' => fn($q) => $q->latest()->take(1)])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        $view = request()->routeIs('seller.*') ? 'Seller/Support/Index' : 'Buyer/Support/Index';
        return Inertia::render($view, ['tickets' => $tickets]);
    }

    public function create()
    {
        $view = request()->routeIs('seller.*') ? 'Seller/Support/Create' : 'Buyer/Support/Create';
        return Inertia::render($view);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject'  => 'required|string|max:255',
            'body'     => 'required|string|max:5000',
            'category' => 'required|in:account,order,payment,product,technical,other',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $ticket = SupportTicket::create([
            'user_id'  => Auth::id(),
            'subject'  => $request->subject,
            'body'     => $request->body,
            'category' => $request->category,
            'priority' => $request->priority,
            'status'   => 'open',
        ]);

        return redirect()->route(request()->routeIs('seller.*') ? 'seller.support.show' : 'buyer.support.show', $ticket)
            ->with('success', 'Your support ticket has been submitted. We will respond shortly.');
    }

    public function show(SupportTicket $ticket)
    {
        // Users can only see their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $ticket->load(['replies.user', 'assignedTo']);

        $view = request()->routeIs('seller.*') ? 'Seller/Support/Show' : 'Buyer/Support/Show';
        return Inertia::render($view, ['ticket' => $ticket]);
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        if ($ticket->status === 'closed') {
            return back()->withErrors(['error' => 'Cannot reply to a closed ticket.']);
        }

        $request->validate(['body' => 'required|string|max:5000']);

        $ticket->replies()->create([
            'user_id'        => Auth::id(),
            'body'           => $request->body,
            'is_staff_reply' => false,
        ]);

        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }

        return back()->with('success', 'Reply sent.');
    }
}
