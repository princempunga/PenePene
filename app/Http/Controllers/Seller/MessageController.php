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

        $conversations = Conversation::with(['buyer.user', 'messages' => function ($q) {
                $q->latest()->take(1);
            }])
            ->where('seller_id', $seller->id)
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('is_read', false)->where('sender_id', '!=', $user->id);
            }])
            ->latest('updated_at')
            ->get();

        return Inertia::render('Seller/Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $user   = $request->user();
        $seller = $user->seller;

        if ($conversation->seller_id !== $seller->id) {
            abort(403);
        }

        // Mark messages from buyer as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = Message::where('conversation_id', $conversation->id)
            ->with('sender')
            ->oldest()
            ->get();

        $conversation->load('buyer.user');

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
