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
            ->where('buyer_id', $buyer->id)
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('is_read', false)->where('sender_id', '!=', $user->id);
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

        if ($conversation->buyer_id !== $buyer->id) {
            abort(403);
        }

        // Mark messages from seller as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

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
            ['buyer_id' => $buyer->id, 'seller_id' => $seller->id],
            ['subject'  => 'General Enquiry']
        );

        return redirect()->route('buyer.messages.show', $conversation);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $user  = $request->user();
        $buyer = $user->buyer;

        if ($conversation->buyer_id !== $buyer->id) {
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
