<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Seller;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $buyer = $user->buyer;

        $conversations = Conversation::with(['seller.user', 'messages' => function ($q) {
                $q->latest()->take(1);
            }])
            ->where('buyer_id', $user->id)
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->whereNull('read_at')->where('sender_id', '!=', $user->id);
            }])
            ->latest('updated_at')
            ->get();

        return Inertia::render('Buyer/Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $user  = $request->user();
        $buyer = $user->buyer;

        if ($conversation->buyer_id !== $user->id) {
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

        $conversation->load('seller.user');

        return Inertia::render('Buyer/Messages/Show', [
            'conversation' => $conversation,
            'messages'     => $messages,
        ]);
    }

    public function startOrShow(Request $request, Seller $seller)
    {
        $user  = $request->user();
        $buyer = $user->buyer;

        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $user->id, 'seller_id' => $seller->id],
        );

        return redirect()->route('buyer.messages.show', $conversation);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $user  = $request->user();
        $buyer = $user->buyer;

        if ($conversation->buyer_id !== $user->id) {
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
