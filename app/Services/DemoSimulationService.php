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

    /** @return array<int, array{label: string, href: string, description: string}> */
    public static function buyerQuickLinks(): array
    {
        return [
            ['label' => 'Catalogue', 'href' => '/products', 'description' => 'Parcourir tous les produits'],
            ['label' => 'Panier', 'href' => '/cart', 'description' => 'Voir votre panier actuel'],
            ['label' => 'Favoris', 'href' => '/buyer/wishlist', 'description' => 'Produits sauvegardés'],
            ['label' => 'Messages', 'href' => '/buyer/messages', 'description' => 'Discuter avec les vendeurs'],
            ['label' => 'Paiement démo', 'href' => '/checkout/simulate', 'description' => 'Simuler un checkout'],
            ['label' => 'Support', 'href' => '/buyer/support', 'description' => 'Ouvrir un ticket'],
        ];
    }

    /** @return array<int, array{label: string, href: string, description: string}> */
    public static function adminQuickLinks(): array
    {
        return [
            ['label' => 'Vendeurs', 'href' => '/admin/sellers', 'description' => 'Gérer les inscriptions et vérifications'],
            ['label' => 'Commandes', 'href' => '/admin/orders', 'description' => 'Suivre les commandes plateforme'],
            ['label' => 'Produits', 'href' => '/admin/products', 'description' => 'Modération du catalogue'],
            ['label' => 'Support', 'href' => '/admin/support', 'description' => 'Tickets et assistance'],
            ['label' => 'Rapports', 'href' => '/admin/reports', 'description' => 'Analyses et exports'],
            ['label' => 'Paramètres', 'href' => '/admin/settings', 'description' => 'Configuration globale'],
        ];
    }

    /** Données fictives pour le panneau admin démo (aucune requête DB). */
    public static function demoAdminPanelData(): array
    {
        return [
            'stats' => [
                'totalUsers'      => 12847,
                'totalSellers'    => 892,
                'pendingSellers'  => 14,
                'totalOrders'     => 3456,
                'totalRevenue'    => 284750000,
                'conversionRate'  => 4.82,
                'activeToday'     => 2341,
                'growthRevenue'   => '+12.4%',
                'growthUsers'     => '+8.1%',
            ],
            'salesChart' => [
                'labels' => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                'values' => [4200000, 5100000, 4800000, 6200000, 5900000, 7100000, 6800000],
            ],
            'trafficSources' => [
                ['label' => 'Organique', 'value' => 42, 'color' => '#0056B3'],
                ['label' => 'Réseaux sociaux', 'value' => 28, 'color' => '#FFB300'],
                ['label' => 'Email', 'value' => 18, 'color' => '#10B981'],
                ['label' => 'Direct', 'value' => 12, 'color' => '#8B5CF6'],
            ],
            'pendingSellers' => [
                [
                    'id'            => 'demo-s-1',
                    'business_name' => 'Kivu Electronics Hub',
                    'owner_name'    => 'Patrick Mbayo',
                    'city'          => 'Goma',
                    'country'       => 'RDC',
                    'category'      => 'Électronique',
                    'avatar'        => 'https://i.pravatar.cc/120?img=12',
                    'cover'         => '/images/demo-products/tv.jpg',
                    'created_at'    => now()->subHours(6)->toISOString(),
                ],
                [
                    'id'            => 'demo-s-2',
                    'business_name' => 'Dar es Salaam Fashion',
                    'owner_name'    => 'Amina Hassan',
                    'city'          => 'Dar es Salaam',
                    'country'       => 'Tanzanie',
                    'category'      => 'Mode',
                    'avatar'        => 'https://i.pravatar.cc/120?img=47',
                    'cover'         => '/images/demo-products/tecno.jpg',
                    'created_at'    => now()->subHours(14)->toISOString(),
                ],
                [
                    'id'            => 'demo-s-3',
                    'business_name' => 'Nairobi Fresh Market',
                    'owner_name'    => 'James Ochieng',
                    'city'          => 'Nairobi',
                    'country'       => 'Kenya',
                    'category'      => 'Alimentation',
                    'avatar'        => 'https://i.pravatar.cc/120?img=33',
                    'cover'         => '/images/demo-products/tv.jpg',
                    'created_at'    => now()->subDay()->toISOString(),
                ],
                [
                    'id'            => 'demo-s-4',
                    'business_name' => 'Lubumbashi Auto Parts',
                    'owner_name'    => 'Grace Mutombo',
                    'city'          => 'Lubumbashi',
                    'country'       => 'RDC',
                    'category'      => 'Automobile',
                    'avatar'        => 'https://i.pravatar.cc/120?img=25',
                    'cover'         => '/images/demo-products/tecno.jpg',
                    'created_at'    => now()->subDays(2)->toISOString(),
                ],
            ],
            'recentOrders' => [
                [
                    'id'           => 'demo-o-1',
                    'order_number' => 'PP-2026-88421',
                    'buyer_name'   => 'Fatou Diallo',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=5',
                    'seller_name'  => 'Kivu Electronics Hub',
                    'product_name' => 'Smart TV Samsung 55"',
                    'product_image'=> '/images/demo-products/tv.jpg',
                    'total'        => 1850000,
                    'status'       => 'delivered',
                    'created_at'   => now()->subMinutes(12)->toISOString(),
                ],
                [
                    'id'           => 'demo-o-2',
                    'order_number' => 'PP-2026-88420',
                    'buyer_name'   => 'Jean Mukendi',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=15',
                    'seller_name'  => 'Dar es Salaam Fashion',
                    'product_name' => 'Tecno Spark 20 Pro',
                    'product_image'=> '/images/demo-products/tecno.jpg',
                    'total'        => 420000,
                    'status'       => 'confirmed',
                    'created_at'   => now()->subHours(2)->toISOString(),
                ],
                [
                    'id'           => 'demo-o-3',
                    'order_number' => 'PP-2026-88419',
                    'buyer_name'   => 'Paul Mwangi',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=8',
                    'seller_name'  => 'Nairobi Fresh Market',
                    'product_name' => 'Panier bio premium',
                    'product_image'=> '/images/demo-products/tv.jpg',
                    'total'        => 95000,
                    'status'       => 'shipped',
                    'created_at'   => now()->subHours(5)->toISOString(),
                ],
                [
                    'id'           => 'demo-o-4',
                    'order_number' => 'PP-2026-88418',
                    'buyer_name'   => 'Marie Kabila',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=32',
                    'seller_name'  => 'Lubumbashi Auto Parts',
                    'product_name' => 'Kit freinage complet',
                    'product_image'=> '/images/demo-products/tecno.jpg',
                    'total'        => 340000,
                    'status'       => 'pending',
                    'created_at'   => now()->subHours(8)->toISOString(),
                ],
                [
                    'id'           => 'demo-o-5',
                    'order_number' => 'PP-2026-88417',
                    'buyer_name'   => 'David Okonkwo',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=51',
                    'seller_name'  => 'Kivu Electronics Hub',
                    'product_name' => 'Smart TV Samsung 55"',
                    'product_image'=> '/images/demo-products/tv.jpg',
                    'total'        => 1850000,
                    'status'       => 'delivered',
                    'created_at'   => now()->subDay()->toISOString(),
                ],
                [
                    'id'           => 'demo-o-6',
                    'order_number' => 'PP-2026-88416',
                    'buyer_name'   => 'Sarah Nsimba',
                    'buyer_avatar' => 'https://i.pravatar.cc/80?img=44',
                    'seller_name'  => 'Dar es Salaam Fashion',
                    'product_name' => 'Tecno Spark 20 Pro',
                    'product_image'=> '/images/demo-products/tecno.jpg',
                    'total'        => 420000,
                    'status'       => 'cancelled',
                    'created_at'   => now()->subDays(2)->toISOString(),
                ],
            ],
            'topProducts' => [
                ['name' => 'Smart TV Samsung 55"', 'image' => '/images/demo-products/tv.jpg', 'sales' => 142, 'revenue' => 262700000, 'seller' => 'Kivu Electronics Hub'],
                ['name' => 'Tecno Spark 20 Pro', 'image' => '/images/demo-products/tecno.jpg', 'sales' => 98, 'revenue' => 41160000, 'seller' => 'Dar es Salaam Fashion'],
                ['name' => 'Kit freinage complet', 'image' => '/images/demo-products/tecno.jpg', 'sales' => 76, 'revenue' => 25840000, 'seller' => 'Lubumbashi Auto Parts'],
                ['name' => 'Panier bio premium', 'image' => '/images/demo-products/tv.jpg', 'sales' => 54, 'revenue' => 5130000, 'seller' => 'Nairobi Fresh Market'],
            ],
            'activityFeed' => [
                ['type' => 'seller', 'text' => 'Nouvelle inscription : Kivu Electronics Hub', 'time' => 'Il y a 6 min', 'avatar' => 'https://i.pravatar.cc/80?img=12'],
                ['type' => 'order', 'text' => 'Commande PP-2026-88421 livrée à Fatou Diallo', 'time' => 'Il y a 12 min', 'avatar' => 'https://i.pravatar.cc/80?img=5'],
                ['type' => 'review', 'text' => 'Nouvel avis 5★ sur Tecno Spark 20 Pro', 'time' => 'Il y a 34 min', 'avatar' => 'https://i.pravatar.cc/80?img=47'],
                ['type' => 'payment', 'text' => 'Paiement TZS 1 850 000 confirmé', 'time' => 'Il y a 1 h', 'avatar' => null],
                ['type' => 'support', 'text' => 'Ticket #1042 résolu par le support', 'time' => 'Il y a 2 h', 'avatar' => 'https://i.pravatar.cc/80?img=33'],
            ],
            'regions' => [
                ['name' => 'Kinshasa', 'orders' => 842, 'pct' => 34],
                ['name' => 'Dar es Salaam', 'orders' => 621, 'pct' => 25],
                ['name' => 'Nairobi', 'orders' => 498, 'pct' => 20],
                ['name' => 'Lubumbashi', 'orders' => 312, 'pct' => 13],
                ['name' => 'Autres', 'orders' => 183, 'pct' => 8],
            ],
        ];
    }
}
