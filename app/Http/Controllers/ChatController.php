<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\PinnedMessage;
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
                    $query->whereRaw('1 = 0'); 
                }
            })
            ->orderByDesc('last_message_at')
            ->get();

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

        $userId = auth()->id();

        $messages = $conversation->messages()
            ->with(['sender', 'receiver'])
            ->oldest()
            ->get()
            ->filter(fn($m) => !$m->isDeletedFor($userId)) // Hide "deleted for me" messages
            ->values();

        // Mark unread as read
        $messages->where('receiver_id', $userId)
                 ->where('is_read', false)
                 ->each->markAsRead();

        // Load pinned messages with the full message
        $pinnedMessages = PinnedMessage::with(['message.sender'])
            ->where('conversation_id', $conversation->id)
            ->whereHas('message', fn($q) => $q->where('is_deleted', false))
            ->orderByDesc('created_at')
            ->get();

        if (request()->wantsJson()) {
            return response()->json([
                'messages'        => $messages,
                'pinned_messages' => $pinnedMessages,
            ]);
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
                'conversations'   => $conversations,
                'conversation'    => $conversation,
                'pinned_messages' => $pinnedMessages,
            ]);
        } elseif ($user->isSeller()) {
            return Inertia::render('Seller/Messages/Show', [
                'conversations'   => $conversations,
                'conversation'    => $conversation,
                'pinned_messages' => $pinnedMessages,
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
            'body'       => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4,webm,mov|max:51200', // 50MB max
        ]);

        if (!$request->body && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        $sender = auth()->user();
        $receiverId = $sender->id === $conversation->buyer_id 
            ? $conversation->seller->user_id 
            : $conversation->buyer_id;

        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id'       => $sender->id,
            'receiver_id'     => $receiverId,
            'body'            => $request->body,
            'message_type'    => 'text',
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
            'body'      => $request->body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return response()->json(['message' => $message]);
    }

    /**
     * Delete a message.
     * delete_type: 'me' (delete for self only) | 'everyone' (soft delete for all)
     */
    public function deleteMessage(Request $request, Message $message)
    {
        $userId = auth()->id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deleteType = $request->input('delete_type', 'me');

        if ($deleteType === 'everyone') {
            // Only sender can delete for everyone
            if ($message->sender_id !== $userId) {
                return response()->json(['message' => 'Only the sender can delete for everyone.'], 403);
            }

            $message->update([
                'is_deleted'      => true,
                'deleted_at'      => now(),
                'body'            => null,
                'attachment_path' => null,
            ]);

            // Also remove any pin if the message was pinned
            PinnedMessage::where('message_id', $message->id)->delete();

        } else {
            // Delete for me: add user to deleted_for array
            $deletedFor = $message->deleted_for ?? [];
            if (!in_array($userId, $deletedFor)) {
                $deletedFor[] = $userId;
            }
            $message->update(['deleted_for' => $deletedFor]);
        }

        return response()->json([
            'message'     => $message->fresh(),
            'delete_type' => $deleteType,
        ]);
    }

    /**
     * Pin a message in a conversation.
     */
    public function pinMessage(Request $request, Conversation $conversation, Message $message)
    {
        $this->authorizeConversation($conversation);

        if ($message->conversation_id !== $conversation->id) {
            return response()->json(['message' => 'Message does not belong to this conversation.'], 422);
        }

        if ($message->is_deleted) {
            return response()->json(['message' => 'Cannot pin a deleted message.'], 422);
        }

        $pinned = PinnedMessage::firstOrCreate([
            'conversation_id' => $conversation->id,
            'message_id'      => $message->id,
        ], [
            'pinned_by' => auth()->id(),
        ]);

        $pinned->load('message.sender');

        return response()->json(['pinned_message' => $pinned]);
    }

    /**
     * Unpin a message.
     */
    public function unpinMessage(Conversation $conversation, Message $message)
    {
        $this->authorizeConversation($conversation);

        PinnedMessage::where('conversation_id', $conversation->id)
            ->where('message_id', $message->id)
            ->delete();

        return response()->json(['success' => true, 'message_id' => $message->id]);
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
