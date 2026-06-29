<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationUserState;
use App\Models\Message;
use App\Models\Order;
use App\Models\User;

/**
 * Crée automatiquement une conversation vendeur/client lors de la confirmation de commande.
 */
class OrderConversationService
{
    public function createForOrder(Order $order, User $buyerUser): Conversation
    {
        $order->loadMissing(['items.product', 'seller']);

        $productId = $order->items->first()?->product_id;

        $conversation = Conversation::firstOrCreate(
            [
                'buyer_id'  => $buyerUser->id,
                'seller_id' => $order->seller_id,
                'product_id'=> $productId,
            ],
            [
                'last_message_at' => now(),
                'status'          => 'confirmed',
            ]
        );

        ConversationUserState::forUser($conversation, $buyerUser->id)->update([
            'deleted_at'  => null,
            'archived_at' => null,
        ]);

        if ($order->seller?->user_id) {
            ConversationUserState::forUser($conversation, $order->seller->user_id)->update([
                'deleted_at'  => null,
                'archived_at' => null,
            ]);
        }

        $productNames = $order->items->pluck('product_name')->filter()->implode(', ');
        $contextBody = "Commande {$order->order_number} confirmée — {$productNames}.";

        $alreadyExists = $conversation->messages()
            ->where('body', 'like', "%{$order->order_number}%")
            ->exists();

        if (! $alreadyExists) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $buyerUser->id,
                'receiver_id'     => $order->seller->user_id,
                'body'            => $contextBody,
                'message_type'    => 'text',
            ]);

            $conversation->update(['last_message_at' => now()]);
        }

        if (! $order->conversation_id) {
            $order->update(['conversation_id' => $conversation->id]);
        }

        return $conversation;
    }
}
