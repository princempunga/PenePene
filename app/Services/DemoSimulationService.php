<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use App\Support\CatalogTranslations;
use App\Support\Translations;
use Illuminate\Support\Facades\Cache;

class DemoSimulationService
{
    public static function enabled(): bool
    {
        return (bool) config('demo.simulation_enabled', true);
    }

    public static function sellerSlug(): string
    {
        return config('demo.seller_slug', 'demo-store');
    }

    public static function demoSeller(): ?Seller
    {
        return Seller::with('user')
            ->where('slug', self::sellerSlug())
            ->where('status', 'verified')
            ->first();
    }

    public static function isDemoSeller(?Seller $seller): bool
    {
        if (! $seller || ! self::enabled()) {
            return false;
        }

        return $seller->slug === self::sellerSlug();
    }

    public static function isDemoSellerId(?int $sellerId): bool
    {
        if (! $sellerId || ! self::enabled()) {
            return false;
        }

        $demo = self::demoSeller();

        return $demo && (int) $demo->id === (int) $sellerId;
    }

    public static function isDemoSellerOnline(): bool
    {
        if (! self::enabled()) {
            return false;
        }

        return Cache::get('demo_seller_online', true);
    }

    public static function setDemoSellerOnline(bool $online): void
    {
        Cache::forever('demo_seller_online', $online);
    }

    public static function applyOnlineStatus(User $user, ?Seller $seller = null): User
    {
        if (self::enabled() && $seller && self::isDemoSeller($seller) && self::isDemoSellerOnline()) {
            $user->is_online = true;
            $user->last_seen_text = Translations::get('chat_ext.active_now');
        } else {
            $user->last_seen_text = $user->getLastSeenText();
        }

        return $user;
    }

    /** @return array<int, string> */
    public static function autoReplyMessages(): array
    {
        return [
            'Bonjour, merci pour votre message. Comment puis-je vous aider ?',
            'Ce produit est disponible.',
            'Nous pouvons organiser la livraison à Kinshasa.',
            'Merci pour votre intérêt ! N\'hésitez pas si vous avez d\'autres questions.',
            'La livraison prend généralement 2 à 3 jours ouvrables.',
        ];
    }

    public static function pickAutoReply(): string
    {
        $messages = self::autoReplyMessages();

        return $messages[array_rand($messages)];
    }

    public static function sendAutoReply(Conversation $conversation, int $sellerUserId): ?Message
    {
        if (! self::enabled() || ! self::isDemoSellerOnline()) {
            return null;
        }

        $conversation->loadMissing('seller');

        if (! self::isDemoSeller($conversation->seller)) {
            return null;
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $sellerUserId,
            'receiver_id'     => $conversation->buyer_id,
            'body'            => self::pickAutoReply(),
            'message_type'    => 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $message;
    }

    public static function scheduleBuyerMessageProgression(Message $message, Conversation $conversation): void
    {
        if (! self::enabled() || ! self::isDemoSellerOnline()) {
            return;
        }

        $conversation->loadMissing('seller');

        if (! self::isDemoSeller($conversation->seller)) {
            return;
        }

        if ((int) $message->sender_id !== (int) $conversation->buyer_id) {
            return;
        }

        $messageId      = $message->id;
        $conversationId = $conversation->id;
        $sellerUserId   = $conversation->seller->user_id;

        dispatch(function () use ($messageId, $conversationId, $sellerUserId) {
            sleep(1);
            Message::where('id', $messageId)->whereNull('delivered_at')->update(['delivered_at' => now()]);

            sleep(1);
            $msg = Message::find($messageId);
            if ($msg && ! $msg->is_read) {
                $msg->markAsRead();
            }

            $conv = Conversation::with('seller')->find($conversationId);

            if ($conv) {
                self::sendAutoReply($conv, $sellerUserId);
            }
        })->afterResponse();
    }

    /** @return array<int, array<string, mixed>> */
    public static function demoReviews(): array
    {
        return [
            [
                'id'         => 'demo-review-1',
                'rating'     => 5,
                'comment'    => 'Très bon vendeur, réponse rapide.',
                'created_at' => now()->subDays(3)->toISOString(),
                'buyer'      => ['name' => 'Marie K.', 'initials' => 'MK'],
            ],
            [
                'id'         => 'demo-review-2',
                'rating'     => 5,
                'comment'    => 'Produit conforme à la description.',
                'created_at' => now()->subDays(7)->toISOString(),
                'buyer'      => ['name' => 'Jean-Paul M.', 'initials' => 'JP'],
            ],
            [
                'id'         => 'demo-review-3',
                'rating'     => 4,
                'comment'    => 'Livraison bien organisée.',
                'created_at' => now()->subDays(12)->toISOString(),
                'buyer'      => ['name' => 'Amina B.', 'initials' => 'AB'],
            ],
            [
                'id'         => 'demo-review-4',
                'rating'     => 5,
                'comment'    => 'Bonne communication avec le vendeur.',
                'created_at' => now()->subDays(18)->toISOString(),
                'buyer'      => ['name' => 'Patrick L.', 'initials' => 'PL'],
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function demoStoreProducts(?Seller $seller): array
    {
        self::syncStoreProducts($seller);

        $category = $seller?->products()->with('category')->active()->first()?->category
            ?? \App\Models\Category::where('slug', 'electronics')->first();

        $items = array_slice(DemoProductService::forCategory($category), 0, 8);

        return CatalogTranslations::localizeProducts($items);
    }

    public static function syncStoreProducts(?Seller $seller): void
    {
        if (! $seller || ! self::isDemoSeller($seller)) {
            return;
        }

        $category = \App\Models\Category::where('slug', 'electronics')->first();
        $demos    = array_slice(DemoProductService::forCategory($category), 0, 8);

        foreach ($demos as $demo) {
            DemoProductService::ensureDatabaseProduct($demo);
        }
    }

    public static function demoOrdersForPanel(): array
    {
        $seller = self::demoSeller();

        if (! $seller) {
            return [];
        }

        return Order::with(['buyer.user', 'items'])
            ->where('seller_id', $seller->id)
            ->latest()
            ->take(20)
            ->get()
            ->map(fn (Order $order) => [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'status'         => $order->status,
                'payment_status' => $order->payment_status ?? 'pending',
                'total'          => $order->total,
                'currency'       => $order->currency,
                'buyer_name'     => $order->buyer?->user?->name ?? 'Buyer',
                'items_count'    => $order->items->count(),
                'created_at'     => $order->created_at?->toISOString(),
            ])
            ->all();
    }

    public static function demoConversationsForPanel(): array
    {
        $seller = self::demoSeller();

        if (! $seller) {
            return [];
        }

        return Conversation::with(['buyer', 'seller', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->where('seller_id', $seller->id)
            ->orderByDesc('last_message_at')
            ->take(20)
            ->get()
            ->map(function (Conversation $conv) {
                $last = $conv->messages->first();
                $sellerUserId = $conv->seller?->user_id;

                return [
                    'id'           => $conv->id,
                    'buyer_name'   => $conv->buyer?->name ?? 'Buyer',
                    'last_message' => $last?->body ?? '',
                    'last_at'      => $conv->last_message_at?->toISOString(),
                    'unread'       => $sellerUserId
                        ? Message::where('conversation_id', $conv->id)
                            ->where('receiver_id', $sellerUserId)
                            ->where('is_read', false)
                            ->count()
                        : 0,
                ];
            })
            ->all();
    }
}
