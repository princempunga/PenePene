<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationUserState;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\PinnedMessage;
use App\Models\StarredMessage;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $conversations = $this->conversationsForUser($user);

        if (request()->wantsJson()) {
            return response()->json(['conversations' => $conversations]);
        }

        if ($user->isBuyer()) {
            return Inertia::render('Buyer/Messages/Index', ['conversations' => $conversations]);
        }

        if ($user->isSeller()) {
            return Inertia::render('Seller/Messages/Index', ['conversations' => $conversations]);
        }

        return abort(403);
    }

    public function startConversation(Request $request)
    {
        $request->validate(['seller_id' => 'required|exists:sellers,id']);

        $buyer = auth()->user();
        if (! $buyer->isBuyer()) {
            return response()->json(['message' => 'Only buyers can start a conversation this way.'], 403);
        }

        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $buyer->id, 'seller_id' => $request->seller_id, 'product_id' => null],
            ['last_message_at' => now()]
        );

        ConversationUserState::forUser($conversation, $buyer->id)->update([
            'deleted_at' => null,
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['conversation_id' => $conversation->id]);
        }

        return redirect()->route('buyer.messages.show', $conversation);
    }

    public function show(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $userId = auth()->id();
        $state = ConversationUserState::forUser($conversation, $userId);

        if ($state->deleted_at) {
            $state->update(['deleted_at' => null]);
        }

        $messages = $this->loadConversationMessages($conversation, $userId);

        $pinnedMessages = PinnedMessage::with(['message.sender'])
            ->where('conversation_id', $conversation->id)
            ->whereHas('message', fn ($q) => $q->where('is_deleted', false))
            ->orderByDesc('created_at')
            ->get();

        if (request()->wantsJson()) {
            return response()->json([
                'messages'         => $messages,
                'pinned_messages'  => $pinnedMessages,
            ]);
        }

        $user = auth()->user();
        $conversations = $this->conversationsForUser($user);
        $conversation->load(['buyer.buyer', 'seller.user']);

        if ($user->isBuyer() && DemoSimulationService::isDemoSeller($conversation->seller)) {
            DemoSimulationService::applyOnlineStatus($conversation->seller->user, $conversation->seller);
        }

        $otherUser = $user->isBuyer()
            ? array_merge($conversation->seller->user->toArray(), [
                'business_name' => $conversation->seller->business_name,
                'logo'          => $conversation->seller->logo,
            ])
            : $conversation->buyer->toArray();

        $page = $user->isBuyer() ? 'Buyer/Messages/Show' : 'Seller/Messages/Show';

        return Inertia::render($page, [
            'conversations'   => $conversations,
            'conversation'    => $conversation,
            'pinned_messages' => $pinnedMessages,
            'otherUser'       => $otherUser,
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $request->validate([
            'body'                 => 'nullable|string|max:5000',
            'attachment'           => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4,webm,mov|max:51200',
            'reply_to_message_id'  => 'nullable|exists:messages,id',
        ]);

        if (! $request->body && ! $request->hasFile('attachment')) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        if ($request->reply_to_message_id) {
            $reply = Message::find($request->reply_to_message_id);
            if (! $reply || $reply->conversation_id !== $conversation->id) {
                return response()->json(['message' => 'Invalid reply target.'], 422);
            }
        }

        $sender = auth()->user();
        $receiverId = $sender->id === $conversation->buyer_id
            ? $conversation->seller->user_id
            : $conversation->buyer_id;

        $messageData = [
            'conversation_id'      => $conversation->id,
            'sender_id'            => $sender->id,
            'receiver_id'          => $receiverId,
            'reply_to_message_id'  => $request->reply_to_message_id,
            'body'                 => $request->body,
            'message_type'         => 'text',
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $mime = $file->getMimeType();
            $path = $file->store('chat', 'public');

            $messageData['attachment_path'] = $path;
            $messageData['attachment_mime'] = $mime;
            $messageData['attachment_size'] = $file->getSize();

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

        ConversationUserState::forUser($conversation, $sender->id)->update(['deleted_at' => null]);

        if ($sender->isBuyer() && DemoSimulationService::isDemoSeller($conversation->seller)) {
            DemoSimulationService::scheduleBuyerMessageProgression($message, $conversation);
        }

        return response()->json([
            'message' => $this->formatMessage($message->load(['sender', 'receiver', 'replyTo.sender', 'reactions.user', 'stars']), $sender->id),
        ]);
    }

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

        return response()->json(['message' => $this->formatMessage($message->fresh(['sender', 'replyTo.sender', 'reactions.user', 'stars']), auth()->id())]);
    }

    public function deleteMessage(Request $request, Message $message)
    {
        $userId = auth()->id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deleteType = $request->input('delete_type', 'me');

        if ($deleteType === 'everyone') {
            if ($message->sender_id !== $userId) {
                return response()->json(['message' => 'Only the sender can delete for everyone.'], 403);
            }

            $message->update([
                'is_deleted'      => true,
                'deleted_at'      => now(),
                'body'            => null,
                'attachment_path' => null,
            ]);

            PinnedMessage::where('message_id', $message->id)->delete();
        } else {
            $deletedFor = $message->deleted_for ?? [];
            if (! in_array($userId, $deletedFor, true)) {
                $deletedFor[] = $userId;
            }
            $message->update(['deleted_for' => $deletedFor]);
        }

        return response()->json([
            'message'     => $message->fresh(),
            'delete_type' => $deleteType,
        ]);
    }

    public function reactMessage(Request $request, Message $message)
    {
        $this->authorizeConversation($message->conversation);

        $request->validate(['emoji' => 'required|string|max:16']);

        MessageReaction::updateOrCreate(
            ['message_id' => $message->id, 'user_id' => auth()->id()],
            ['emoji' => $request->emoji]
        );

        return response()->json([
            'reactions' => $this->reactionsForMessage($message->fresh('reactions.user'), auth()->id()),
        ]);
    }

    public function unreactMessage(Message $message)
    {
        $this->authorizeConversation($message->conversation);

        MessageReaction::where('message_id', $message->id)
            ->where('user_id', auth()->id())
            ->delete();

        return response()->json([
            'reactions' => $this->reactionsForMessage($message->fresh('reactions.user'), auth()->id()),
        ]);
    }

    public function starMessage(Message $message)
    {
        $this->authorizeConversation($message->conversation);

        StarredMessage::firstOrCreate([
            'message_id' => $message->id,
            'user_id'    => auth()->id(),
        ]);

        return response()->json(['is_starred' => true]);
    }

    public function unstarMessage(Message $message)
    {
        $this->authorizeConversation($message->conversation);

        StarredMessage::where('message_id', $message->id)
            ->where('user_id', auth()->id())
            ->delete();

        return response()->json(['is_starred' => false]);
    }

    public function forwardMessage(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $request->validate([
            'message_id'              => 'required|exists:messages,id',
            'target_conversation_id'  => 'required|exists:conversations,id',
        ]);

        $source = Message::findOrFail($request->message_id);
        $target = Conversation::with('seller')->findOrFail($request->target_conversation_id);

        $this->authorizeConversation($target);

        $sender = auth()->user();
        $receiverId = $sender->id === $target->buyer_id
            ? $target->seller->user_id
            : $target->buyer_id;

        $body = $source->body;
        if ($source->attachment_path && ! $body) {
            $body = match ($source->message_type) {
                'image' => '[Forwarded image]',
                'video' => '[Forwarded video]',
                default => '[Forwarded file]',
            };
        }

        $forwarded = Message::create([
            'conversation_id' => $target->id,
            'sender_id'       => $sender->id,
            'receiver_id'     => $receiverId,
            'body'            => $body ? "↪ {$body}" : null,
            'message_type'    => $source->message_type,
            'attachment_path' => $source->attachment_path,
            'attachment_mime' => $source->attachment_mime,
            'attachment_size' => $source->attachment_size,
        ]);

        $target->update(['last_message_at' => now()]);

        return response()->json([
            'conversation_id' => $target->id,
            'message'         => $this->formatMessage($forwarded->load(['sender', 'receiver']), $sender->id),
        ]);
    }

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

    public function unpinMessage(Conversation $conversation, Message $message)
    {
        $this->authorizeConversation($conversation);

        PinnedMessage::where('conversation_id', $conversation->id)
            ->where('message_id', $message->id)
            ->delete();

        return response()->json(['success' => true, 'message_id' => $message->id]);
    }

    public function markAsRead(Message $message)
    {
        if ($message->receiver_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->markAsRead();

        return response()->json(['message' => $message]);
    }

    public function deleteConversation(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        ConversationUserState::forUser($conversation, auth()->id())->update([
            'deleted_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function clearConversation(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        ConversationUserState::forUser($conversation, auth()->id())->update([
            'cleared_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function archiveConversation(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        ConversationUserState::forUser($conversation, auth()->id())->update([
            'archived_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    private function conversationsForUser($user)
    {
        $query = Conversation::with(['buyer.buyer', 'seller.user', 'latestMessage'])
            ->where(function ($q) use ($user) {
                if ($user->isBuyer()) {
                    $q->where('buyer_id', $user->id);
                } elseif ($user->isSeller() && $user->seller) {
                    $q->where('seller_id', $user->seller->id);
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->whereDoesntHave('userStates', function ($q) use ($user) {
                $q->where('user_id', $user->id)->whereNotNull('deleted_at');
            })
            ->whereDoesntHave('userStates', function ($q) use ($user) {
                $q->where('user_id', $user->id)->whereNotNull('archived_at');
            })
            ->orderByDesc('last_message_at');

        return $query->get()->map(function (Conversation $conv) use ($user) {
            if ($user->isBuyer() && DemoSimulationService::isDemoSeller($conv->seller)) {
                DemoSimulationService::applyOnlineStatus($conv->seller->user, $conv->seller);
            }

            return $conv;
        });
    }

    private function loadConversationMessages(Conversation $conversation, int $userId)
    {
        $state = ConversationUserState::forUser($conversation, $userId);

        $query = $conversation->messages()
            ->with(['sender', 'receiver', 'replyTo.sender', 'reactions.user', 'stars'])
            ->oldest();

        if ($state->cleared_at) {
            $query->where('created_at', '>', $state->cleared_at);
        }

        $messages = $query->get()->filter(fn (Message $m) => ! $m->isDeletedFor($userId));

        $messages->where('receiver_id', $userId)->each(function (Message $m) {
            $m->markAsDelivered();
        });

        $messages->where('receiver_id', $userId)
            ->where('is_read', false)
            ->each->markAsRead();

        return $messages
            ->map(fn (Message $m) => $this->formatMessage($m, $userId))
            ->values();
    }

    private function formatMessage(Message $message, int $userId): array
    {
        $data = $message->toArray();
        $data['reactions'] = $this->reactionsForMessage($message, $userId);
        $data['is_starred'] = $message->stars->contains('user_id', $userId);

        if ((int) $message->sender_id === $userId) {
            $data['status'] = $message->deliveryStatus();
        }

        return $data;
    }

    private function reactionsForMessage(Message $message, int $userId): array
    {
        return $message->reactions
            ->groupBy('emoji')
            ->map(fn ($group, $emoji) => [
                'emoji'         => $emoji,
                'count'         => $group->count(),
                'reacted_by_me' => $group->contains('user_id', $userId),
            ])
            ->values()
            ->all();
    }

    private function authorizeConversation(Conversation $conversation): void
    {
        $user = auth()->user();
        $isParticipant = ($user->id === $conversation->buyer_id)
            || ($user->seller && $user->seller->id === $conversation->seller_id);

        if (! $isParticipant) {
            abort(403, 'Unauthorized access to this conversation.');
        }
    }
}
