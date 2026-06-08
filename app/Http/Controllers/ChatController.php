<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Display a listing of conversations.
     */
    public function index()
    {
        $user = auth()->user();
        
        $conversations = Conversation::with(['buyer.user', 'seller.user', 'latestMessage'])
            ->where(function ($query) use ($user) {
                if ($user->isBuyer()) {
                    $query->where('buyer_id', $user->id);
                } elseif ($user->isSeller() && $user->seller) {
                    $query->where('seller_id', $user->seller->id);
                } else {
                    // Admins see nothing here by default
                    $query->whereRaw('1 = 0'); 
                }
            })
            ->orderByDesc('last_message_at')
            ->get();

        // For Inertia, return the appropriate view based on role
        if ($user->isBuyer()) {
            return Inertia::render('Buyer/Messages/Index', ['conversations' => $conversations]);
        } elseif ($user->isSeller()) {
            return Inertia::render('Seller/Messages/Index', ['conversations' => $conversations]);
        }
        
        return abort(403);
    }

    /**
     * Start a conversation with a seller from their store.
     */
    public function startConversation(Request $request)
    {
        $request->validate(['seller_id' => 'required|exists:sellers,id']);
        
        $buyer = auth()->user();
        if (!$buyer->isBuyer()) {
            return response()->json(['message' => 'Only buyers can start a conversation this way.'], 403);
        }

        $sellerId = $request->seller_id;
        
        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $buyer->id, 'seller_id' => $sellerId],
            ['last_message_at' => now()]
        );

        return response()->json(['conversation_id' => $conversation->id]);
    }

    /**
     * Display a specific conversation and its messages.
     */
    public function show(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $messages = $conversation->messages()
            ->with(['sender', 'receiver'])
            ->oldest()
            ->get();

        // Mark unread as read
        $messages->where('receiver_id', auth()->id())
                 ->where('is_read', false)
                 ->each->markAsRead();

        if (request()->wantsJson()) {
            return response()->json(['messages' => $messages]);
        }

        $user = auth()->user();
        
        $conversations = Conversation::with(['buyer.user', 'seller.user', 'latestMessage'])
            ->where(function ($query) use ($user) {
                if ($user->isBuyer()) {
                    $query->where('buyer_id', $user->id);
                } elseif ($user->isSeller() && $user->seller) {
                    $query->where('seller_id', $user->seller->id);
                } else {
                    $query->whereRaw('1 = 0'); 
                }
            })
            ->orderByDesc('last_message_at')
            ->get();

        $conversation->load(['buyer.user', 'seller.user']);
        
        if ($user->isBuyer()) {
            return Inertia::render('Buyer/Messages/Show', [
                'conversations' => $conversations,
                'conversation' => $conversation,
            ]);
        } elseif ($user->isSeller()) {
            return Inertia::render('Seller/Messages/Show', [
                'conversations' => $conversations,
                'conversation' => $conversation,
            ]);
        }

        return abort(403);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $request->validate([
            'body' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4,webm,mov|max:25600', // 25MB max
        ]);

        if (!$request->body && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        $sender = auth()->user();
        // Determine receiver
        $receiverId = $sender->id === $conversation->buyer_id 
            ? $conversation->seller->user_id 
            : $conversation->buyer_id;

        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'body' => $request->body,
            'message_type' => 'text',
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $mime = $file->getMimeType();
            $size = $file->getSize();
            $path = $file->store('chat_attachments', 'public');

            $messageData['attachment_path'] = $path;
            $messageData['attachment_mime'] = $mime;
            $messageData['attachment_size'] = $size;
            
            if (Str::startsWith($mime, 'image/')) {
                $messageData['message_type'] = 'image';
            } elseif (Str::startsWith($mime, 'video/')) {
                $messageData['message_type'] = 'video';
            } else {
                $messageData['message_type'] = 'file';
            }
        }

        $message = Message::create($messageData);
        $conversation->update(['last_message_at' => now()]);

        return response()->json(['message' => $message->load(['sender', 'receiver'])]);
    }

    /**
     * Edit a message.
     */
    public function editMessage(Request $request, Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($message->is_deleted) {
            return response()->json(['message' => 'Cannot edit a deleted message.'], 403);
        }

        $request->validate(['body' => 'required|string|max:5000']);

        $message->update([
            'body' => $request->body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return response()->json(['message' => $message]);
    }

    /**
     * Delete a message (soft delete logic, sets is_deleted).
     */
    public function deleteMessage(Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update([
            'is_deleted' => true,
            'deleted_at' => now(),
            'body' => null, // clear content
            'attachment_path' => null, // clear attachment reference
        ]);

        return response()->json(['message' => $message]);
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead(Message $message)
    {
        if ($message->receiver_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->markAsRead();

        return response()->json(['message' => $message]);
    }

    /**
     * Authorize user belongs to conversation.
     */
    private function authorizeConversation(Conversation $conversation)
    {
        $user = auth()->user();
        $isParticipant = false;

        if ($user->id === $conversation->buyer_id) {
            $isParticipant = true;
        } elseif ($user->seller && $user->seller->id === $conversation->seller_id) {
            $isParticipant = true;
        }

        if (!$isParticipant) {
            abort(403, 'Unauthorized access to this conversation.');
        }
    }
}
