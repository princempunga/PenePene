<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Message;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $seller = $user->seller;
        $search = $request->get('search');

        $conversations = Conversation::with(['buyer', 'messages' => function ($q) {
                $q->latest()->take(1);
            }])
            ->where('seller_id', $seller->id)
            ->when($search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->whereHas('buyer', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('messages', function ($m) use ($search) {
                        $m->where('body', 'like', "%{$search}%");
                    });
                });
            })
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->whereNull('read_at')->where('sender_id', '!=', $user->id);
            }])
            ->latest('updated_at')
            ->get();

        return Inertia::render('Seller/Messages/Index', [
            'conversations' => $conversations,
            'filters'       => ['search' => $search ?? ''],
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $user   = $request->user();
        $seller = $user->seller;

        if ($conversation->seller_id !== $seller->id) {
            abort(403);
        }

        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where('conversation_id', $conversation->id)
            ->with('sender')
            ->oldest()
            ->get();

        $conversation->load(['buyer.buyer']);

        return Inertia::render('Seller/Messages/Show', [
            'conversation' => $conversation,
            'messages'     => $messages,
        ]);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $user   = $request->user();
        $seller = $user->seller;

        if ($conversation->seller_id !== $seller->id) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $request->body,
        ]);

        $conversation->touch();

        return back();
    }
}
