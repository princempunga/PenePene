<?php

namespace App\Services;

use Illuminate\Support\Collection;

class AdminDemoDataService
{
    public static function enabled(): bool
    {
        return DemoSimulationService::enabled();
    }

    /** @return array<string, mixed> */
    public static function dashboardStats(): array
    {
        $panel = DemoSimulationService::demoAdminPanelData();

        return [
            'totalUsers'   => $panel['stats']['totalUsers'],
            'totalSellers' => $panel['stats']['totalSellers'],
            'totalOrders'  => $panel['stats']['totalOrders'],
            'totalRevenue' => $panel['stats']['totalRevenue'],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function pendingSellers(): array
    {
        return array_map(fn (array $s) => [
            'id'            => $s['id'],
            'business_name' => $s['business_name'],
            'city'          => $s['city'],
            'country'       => $s['country'],
            'status'        => 'pending',
            'created_at'    => $s['created_at'],
            'user'          => [
                'name'  => $s['owner_name'],
                'email' => strtolower(str_replace(' ', '.', $s['owner_name'])) . '@demo.local',
            ],
        ], DemoSimulationService::demoAdminPanelData()['pendingSellers']);
    }

    /** @return array<int, array<string, mixed>> */
    public static function recentOrders(): array
    {
        return array_map(fn (array $o) => [
            'id'           => $o['id'],
            'order_number' => $o['order_number'],
            'status'       => $o['status'],
            'total_amount' => $o['total'],
            'created_at'   => $o['created_at'],
            'buyer'        => ['user' => ['name' => $o['buyer_name']]],
            'seller'       => ['business_name' => $o['seller_name']],
        ], array_slice(DemoSimulationService::demoAdminPanelData()['recentOrders'], 0, 5));
    }

    /** @return array<int, array<string, mixed>> */
    public static function sellers(?string $status = null): array
    {
        $items = [
            self::sellerRow('demo-s-1', 'Kivu Electronics Hub', 'Patrick Mbayo', 'Goma', 'RDC', 'pending', 0),
            self::sellerRow('demo-s-2', 'Dar es Salaam Fashion', 'Amina Hassan', 'Dar es Salaam', 'Tanzanie', 'pending', 1),
            self::sellerRow('demo-s-3', 'Nairobi Fresh Market', 'James Ochieng', 'Nairobi', 'Kenya', 'verified', 3),
            self::sellerRow('demo-s-4', 'Lubumbashi Auto Parts', 'Grace Mutombo', 'Lubumbashi', 'RDC', 'verified', 5),
            self::sellerRow('demo-s-5', 'Demo Store PenePene', 'Demo Seller', 'Dar es Salaam', 'Tanzanie', 'verified', 10),
            self::sellerRow('demo-s-6', 'Kinshasa Tech Zone', 'Eric Kabongo', 'Kinshasa', 'RDC', 'active', 7),
            self::sellerRow('demo-s-7', 'Mwanza Crafts', 'Neema Juma', 'Mwanza', 'Tanzanie', 'suspended', 14),
            self::sellerRow('demo-s-8', 'Bukavu Mobile Shop', 'Claude Bahati', 'Bukavu', 'RDC', 'rejected', 20),
        ];

        return self::filterByStatus($items, $status);
    }

    /** @return array<int, array<string, mixed>> */
    public static function orders(?string $status = null): array
    {
        $items = [
            self::orderRow('demo-o-1', 'PP-2026-88421', 'Fatou Diallo', 'Kivu Electronics Hub', 1850000, 'delivered', 0),
            self::orderRow('demo-o-2', 'PP-2026-88420', 'Jean Mukendi', 'Dar es Salaam Fashion', 420000, 'confirmed', 0),
            self::orderRow('demo-o-3', 'PP-2026-88419', 'Paul Mwangi', 'Nairobi Fresh Market', 95000, 'shipped', 1),
            self::orderRow('demo-o-4', 'PP-2026-88418', 'Marie Kabila', 'Lubumbashi Auto Parts', 340000, 'pending', 1),
            self::orderRow('demo-o-5', 'PP-2026-88417', 'David Okonkwo', 'Kivu Electronics Hub', 1850000, 'delivered', 2),
            self::orderRow('demo-o-6', 'PP-2026-88416', 'Sarah Nsimba', 'Dar es Salaam Fashion', 420000, 'cancelled', 3),
            self::orderRow('demo-o-7', 'PP-2026-88415', 'Ibrahim Saidi', 'Demo Store PenePene', 275000, 'pending', 4),
            self::orderRow('demo-o-8', 'PP-2026-88414', 'Chantal Mputu', 'Kinshasa Tech Zone', 890000, 'shipped', 5),
            self::orderRow('demo-o-9', 'PP-2026-88413', 'Omar Hassan', 'Nairobi Fresh Market', 125000, 'confirmed', 6),
            self::orderRow('demo-o-10', 'PP-2026-88412', 'Lucie Tshisekedi', 'Lubumbashi Auto Parts', 560000, 'delivered', 8),
        ];

        return self::filterByStatus($items, $status);
    }

    /** @return array<int, array<string, mixed>> */
    public static function products(?string $status = null): array
    {
        $items = [
            self::productRow('demo-p-1', 'Smart TV Samsung 55"', 'Électronique', 'Kivu Electronics Hub', 1850000, 12, 3, 'pending'),
            self::productRow('demo-p-2', 'Tecno Spark 20 Pro', 'Téléphones', 'Dar es Salaam Fashion', 420000, 45, 8, 'pending'),
            self::productRow('demo-p-3', 'Kit freinage complet', 'Automobile', 'Lubumbashi Auto Parts', 340000, 20, 5, 'pending'),
            self::productRow('demo-p-4', 'Panier bio premium', 'Alimentation', 'Nairobi Fresh Market', 95000, 30, 2, 'pending'),
            self::productRow('demo-p-5', 'Casque Bluetooth Pro', 'Électronique', 'Kinshasa Tech Zone', 89000, 60, 12, 'active'),
            self::productRow('demo-p-6', 'Robe wax premium', 'Mode', 'Dar es Salaam Fashion', 65000, 25, 0, 'active'),
            self::productRow('demo-p-7', 'Contrefaçon suspecte', 'Divers', 'Bukavu Mobile Shop', 15000, 100, 0, 'rejected'),
            self::productRow('demo-p-8', 'Tablette enfant 10"', 'Électronique', 'Demo Store PenePene', 275000, 18, 1, 'pending'),
        ];

        return self::filterByStatus($items, $status);
    }

    /** @return array<int, array<string, mixed>> */
    public static function reviews(): array
    {
        return [
            self::reviewRow('demo-r-1', 'Marie K.', 'Kivu Electronics Hub', 'PP-2026-88421', 5, 'Très bon vendeur, réponse rapide.', 2),
            self::reviewRow('demo-r-2', 'Jean-Paul M.', 'Dar es Salaam Fashion', 'PP-2026-88420', 5, 'Produit conforme à la description.', 5),
            self::reviewRow('demo-r-3', 'Amina B.', 'Nairobi Fresh Market', 'PP-2026-88419', 4, 'Livraison bien organisée.', 8),
            self::reviewRow('demo-r-4', 'Patrick L.', 'Lubumbashi Auto Parts', 'PP-2026-88418', 5, 'Bonne communication avec le vendeur.', 12),
            self::reviewRow('demo-r-5', 'Fatou D.', 'Demo Store PenePene', 'PP-2026-88417', 3, 'Délai un peu long mais satisfait.', 15),
            self::reviewRow('demo-r-6', 'Paul M.', 'Kinshasa Tech Zone', 'PP-2026-88416', 5, 'Excellent rapport qualité-prix.', 18),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function supportTickets(?string $status = null, ?string $priority = null): array
    {
        $items = [
            self::ticketRow('demo-t-1', 'TK-1042', 'Paiement bloqué sur commande', 'payments', 'high', 'open', 'Fatou Diallo', 1),
            self::ticketRow('demo-t-2', 'TK-1041', 'Vendeur non vérifié depuis 7 jours', 'sellers', 'medium', 'in_progress', 'Jean Mukendi', 2),
            self::ticketRow('demo-t-3', 'TK-1040', 'Produit endommagé à la réception', 'orders', 'urgent', 'open', 'Marie Kabila', 0),
            self::ticketRow('demo-t-4', 'TK-1039', 'Demande remboursement', 'orders', 'high', 'resolved', 'David Okonkwo', 5),
            self::ticketRow('demo-t-5', 'TK-1038', 'Bug affichage catalogue mobile', 'technical', 'low', 'closed', 'Paul Mwangi', 10),
            self::ticketRow('demo-t-6', 'TK-1037', 'Question sur abonnement vendeur', 'billing', 'medium', 'in_progress', 'Sarah Nsimba', 3),
        ];

        if ($status && $status !== 'all') {
            $items = array_values(array_filter($items, fn ($t) => $t['status'] === $status));
        }

        if ($priority && $priority !== 'all') {
            $items = array_values(array_filter($items, fn ($t) => $t['priority'] === $priority));
        }

        return $items;
    }

    /** @return array<int, array<string, mixed>> */
    public static function advertisements(?string $status = null): array
    {
        $items = [
            self::adRow('demo-a-1', 'Kivu Electronics Hub', 'seller@demo.local', 'Smart TV Samsung 55"', 'homepage_banner', 'pending', 0, 30),
            self::adRow('demo-a-2', 'Dar es Salaam Fashion', 'fashion@demo.local', 'Tecno Spark 20 Pro', 'category_top', 'pending', 1, 14),
            self::adRow('demo-a-3', 'Demo Store PenePene', 'seller@penepene.co.tz', 'Tablette enfant 10"', 'search_boost', 'active', 5, 60),
            self::adRow('demo-a-4', 'Kinshasa Tech Zone', 'tech@demo.local', 'Casque Bluetooth Pro', 'homepage_banner', 'rejected', 10, 7),
            self::adRow('demo-a-5', 'Nairobi Fresh Market', 'fresh@demo.local', 'Panier bio premium', 'category_top', 'completed', 45, 30),
        ];

        return self::filterByStatus($items, $status);
    }

    /** @return array<string, mixed> */
    public static function reportStats(): array
    {
        return [
            'total_gmv'      => 284750000,
            'total_orders'   => 3456,
            'total_sellers'  => 892,
            'total_products' => 4210,
            'open_tickets'   => 12,
            'pending_ads'    => 2,
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function categories(): array
    {
        return [
            self::categoryRow('demo-c-1', 'Électronique', 'electronics', [
                self::categoryRow('demo-c-1a', 'Téléphones', 'phones', [], 'demo-c-1'),
                self::categoryRow('demo-c-1b', 'TV & Audio', 'tv-audio', [], 'demo-c-1'),
            ]),
            self::categoryRow('demo-c-2', 'Mode', 'fashion', [
                self::categoryRow('demo-c-2a', 'Homme', 'men', [], 'demo-c-2'),
                self::categoryRow('demo-c-2b', 'Femme', 'women', [], 'demo-c-2'),
            ]),
            self::categoryRow('demo-c-3', 'Alimentation', 'food', []),
            self::categoryRow('demo-c-4', 'Automobile', 'auto', []),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function flatCategories(): array
    {
        $flat = [];
        $walk = function (array $nodes) use (&$flat, &$walk) {
            foreach ($nodes as $node) {
                $children = $node['children'] ?? [];
                unset($node['children']);
                $flat[] = $node;
                if ($children) {
                    $walk($children);
                }
            }
        };
        $walk(self::categories());

        return $flat;
    }

    /** @return array<int, array<string, mixed>> */
    public static function subscriptionPlans(): array
    {
        return [
            [
                'id'            => 'demo-plan-1',
                'name'          => 'Starter',
                'slug'          => 'starter',
                'description'   => 'Idéal pour débuter sur la marketplace.',
                'price'         => 25000,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'features'      => json_encode(['50 produits', 'Support email', 'Statistiques basiques']),
                'is_active'     => true,
                'sort_order'    => 1,
            ],
            [
                'id'            => 'demo-plan-2',
                'name'          => 'Pro',
                'slug'          => 'pro',
                'description'   => 'Pour vendeurs en croissance.',
                'price'         => 75000,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'features'      => json_encode(['500 produits', 'Support prioritaire', 'Annonces sponsorisées']),
                'is_active'     => true,
                'sort_order'    => 2,
            ],
            [
                'id'            => 'demo-plan-3',
                'name'          => 'Enterprise',
                'slug'          => 'enterprise',
                'description'   => 'Volume illimité et API.',
                'price'         => 199000,
                'currency'      => 'TZS',
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'features'      => json_encode(['Produits illimités', 'Account manager', 'API access']),
                'is_active'     => true,
                'sort_order'    => 3,
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function subAdmins(): array
    {
        return [
            [
                'id'         => 'demo-admin-1',
                'name'       => 'Sophie Admin',
                'email'      => 'sophie.admin@penepene.co.tz',
                'phone'      => '+255 712 000 001',
                'role'       => 'admin',
                'created_at' => now()->subMonths(2)->toISOString(),
            ],
            [
                'id'         => 'demo-admin-2',
                'name'       => 'Marc Ops',
                'email'      => 'marc.ops@penepene.co.tz',
                'phone'      => '+255 712 000 002',
                'role'       => 'admin',
                'created_at' => now()->subMonth()->toISOString(),
            ],
        ];
    }

    /** @return array<string, Collection<int, object>> */
    public static function platformSettings(): array
    {
        $row = fn (string $key, string $value, string $group, string $label, string $type = 'text') => (object) [
            'key'   => $key,
            'value' => $value,
            'group' => $group,
            'label' => $label,
            'type'  => $type,
        ];

        return [
            'general' => collect([
                $row('platform_name', 'PenePene', 'general', 'Nom de la plateforme'),
                $row('support_email', 'support@penepene.co.tz', 'general', 'Email support'),
                $row('default_currency', 'TZS', 'general', 'Devise par défaut'),
            ]),
            'marketplace' => collect([
                $row('commission_rate', '8', 'marketplace', 'Commission (%)', 'number'),
                $row('min_payout_amount', '50000', 'marketplace', 'Payout minimum (TZS)', 'number'),
                $row('auto_verify_sellers', '0', 'marketplace', 'Vérification auto vendeurs', 'boolean'),
            ]),
            'maintenance' => collect([
                $row('maintenance_mode', '0', 'maintenance', 'Mode maintenance', 'boolean'),
                $row('maintenance_message', 'Maintenance planifiée. Retour sous peu.', 'maintenance', 'Message maintenance'),
            ]),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function supportAdmins(): array
    {
        return [
            ['id' => 'demo-admin-1', 'name' => 'Sophie Admin'],
            ['id' => 'demo-admin-2', 'name' => 'Marc Ops'],
        ];
    }

    // ─── Helpers ───────────────────────────────────────────────

    /** @param array<int, array<string, mixed>> $items */
    private static function filterByStatus(array $items, ?string $status): array
    {
        if (! $status || $status === 'all') {
            return $items;
        }

        return array_values(array_filter($items, fn ($row) => ($row['status'] ?? null) === $status));
    }

    private static function sellerRow(
        string $id,
        string $business,
        string $owner,
        string $city,
        string $country,
        string $status,
        int $daysAgo
    ): array {
        return [
            'id'            => $id,
            'business_name' => $business,
            'city'          => $city,
            'country'       => $country,
            'status'        => $status,
            'created_at'    => now()->subDays($daysAgo)->toISOString(),
            'user'          => [
                'name'  => $owner,
                'email' => strtolower(str_replace(' ', '.', $owner)) . '@demo.local',
            ],
        ];
    }

    private static function orderRow(
        string $id,
        string $number,
        string $buyer,
        string $seller,
        int $total,
        string $status,
        int $daysAgo
    ): array {
        return [
            'id'           => $id,
            'order_number' => $number,
            'status'       => $status,
            'total_amount' => $total,
            'created_at'   => now()->subDays($daysAgo)->toISOString(),
            'buyer'        => ['user' => ['name' => $buyer]],
            'seller'       => ['business_name' => $seller],
        ];
    }

    private static function productRow(
        string $id,
        string $name,
        string $category,
        string $seller,
        int $price,
        int $stock,
        int $sold,
        string $status
    ): array {
        $images = [
            '/images/demo-products/tv.jpg',
            '/images/demo-products/tecno.jpg',
        ];

        return [
            'id'              => $id,
            'name'            => $name,
            'price'           => $price,
            'status'          => $status,
            'initial_stock'   => $stock,
            'confirmed_sales' => $sold,
            'demo_image'      => $images[crc32($id) % count($images)],
            'category'        => ['name' => $category],
            'seller'          => ['business_name' => $seller],
            'images'          => [],
        ];
    }

    private static function reviewRow(
        string $id,
        string $buyer,
        string $seller,
        string $orderNumber,
        int $rating,
        string $comment,
        int $daysAgo
    ): array {
        return [
            'id'         => $id,
            'rating'     => $rating,
            'comment'    => $comment,
            'created_at' => now()->subDays($daysAgo)->toISOString(),
            'buyer'      => ['user' => ['name' => $buyer]],
            'seller'     => ['business_name' => $seller],
            'order'      => ['order_number' => $orderNumber],
        ];
    }

    private static function ticketRow(
        string $id,
        string $number,
        string $subject,
        string $category,
        string $priority,
        string $status,
        string $userName,
        int $daysAgo
    ): array {
        return [
            'id'            => $id,
            'ticket_number' => $number,
            'subject'       => $subject,
            'category'      => $category,
            'priority'      => $priority,
            'status'        => $status,
            'created_at'    => now()->subDays($daysAgo)->toISOString(),
            'user'          => [
                'name'  => $userName,
                'email' => strtolower(str_replace(' ', '.', $userName)) . '@demo.local',
            ],
            'assignedTo'    => $status === 'open' ? null : ['name' => 'Sophie Admin'],
        ];
    }

    private static function adRow(
        string $id,
        string $seller,
        string $email,
        string $product,
        string $placement,
        string $status,
        int $startDaysAgo,
        int $duration
    ): array {
        return [
            'id'         => $id,
            'placement'  => $placement,
            'status'     => $status,
            'starts_at'  => now()->subDays($startDaysAgo)->toISOString(),
            'expires_at' => now()->subDays($startDaysAgo)->addDays($duration)->toISOString(),
            'seller'     => [
                'business_name' => $seller,
                'user'          => ['email' => $email],
            ],
            'product'    => ['name' => $product],
        ];
    }

    /** @param array<int, array<string, mixed>> $children */
    private static function categoryRow(
        string $id,
        string $name,
        string $slug,
        array $children = [],
        ?string $parentId = null
    ): array {
        return [
            'id'        => $id,
            'name'      => $name,
            'slug'      => $slug,
            'parent_id' => $parentId,
            'is_active' => true,
            'icon'      => null,
            'children'  => $children,
        ];
    }
}
