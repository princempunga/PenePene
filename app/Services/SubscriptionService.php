<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanChange;
use App\Models\SubscriptionProductDisable;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Abonnement actif du vendeur (statut actif + non expiré),
     * ou null s'il n'en a pas.
     */
    public function activeSubscription(Seller $seller): ?Subscription
    {
        return $seller->activeSubscription()
            ->where('expires_at', '>', now())
            ->with('plan')
            ->first();
    }

    /**
     * Plan effectif du vendeur : son plan actif, ou le plan Gratuit
     * (premier plan actif, prix 0) comme plan par défaut.
     */
    public function effectivePlan(Seller $seller): SubscriptionPlan
    {
        $sub = $this->activeSubscription($seller);

        if ($sub && $sub->plan) {
            return $sub->plan;
        }

        return SubscriptionPlan::active()
            ->where('price', 0)
            ->orderBy('sort_order')
            ->first()
            ?? new SubscriptionPlan(['name' => 'Gratuit', 'product_limit' => 15, 'featured_slots' => 0]);
    }

    /**
     * Nombre de produits actifs du vendeur.
     */
    public function activeProductCount(Seller $seller): int
    {
        return $seller->products()->where('status', 'active')->count();
    }

    /**
     * Le vendeur peut-il créer un produit de plus ?
     * Retourne [bool, message].
     */
    public function canAddProduct(Seller $seller): array
    {
        $plan = $this->effectivePlan($seller);
        $used = $this->activeProductCount($seller);

        // Limite NULL = illimité
        if ($plan->product_limit === null) {
            return [true, ''];
        }

        if ($used >= (int) $plan->product_limit) {
            $planName = $plan->name;
            $next = SubscriptionPlan::active()->where('sort_order', '>', $plan->sort_order)->orderBy('sort_order')->first();

            $message = "Vous avez atteint la limite de votre plan {$planName} ({$used}/{$plan->product_limit} produits).";
            if ($next) {
                $message .= " Passez au plan {$next->name} pour ajouter plus de produits.";
            }

            return [false, $message];
        }

        return [true, ''];
    }

    /**
     * Mises en avant (featured) utilisées / disponibles sur le plan courant.
     */
    public function featuredUsage(Seller $seller): array
    {
        $plan = $this->effectivePlan($seller);
        $sub = $this->activeSubscription($seller);
        $used = (int) ($sub?->featured_used ?? 0);
        $quota = (int) $plan->featured_slots;

        return [
            'used' => $used,
            'quota' => $quota,
            'remaining' => max(0, $quota - $used),
            'unlimited' => false,
        ];
    }

    public function canAddFeatured(Seller $seller): array
    {
        $usage = $this->featuredUsage($seller);

        if ($usage['remaining'] <= 0) {
            return [false, "Vous avez utilisé toutes vos mises en avant ({$usage['used']}/{$usage['quota']}). Passez à un plan supérieur pour en obtenir davantage."];
        }

        return [true, ''];
    }

    public function incrementFeaturedUsage(Seller $seller): bool
    {
        $sub = $this->activeSubscription($seller);

        if (! $sub) {
            return false;
        }

        $sub->increment('featured_used');

        return true;
    }

    public function decrementFeaturedUsage(Seller $seller): void
    {
        $sub = $this->activeSubscription($seller);

        if ($sub && $sub->featured_used > 0) {
            $sub->decrement('featured_used');
        }
    }

    /**
     * Souscription / changement de plan.
     * Gère upgrade, downgrade, expiration de l'ancien abonnement,
     * l'historique, et les produits excédentaires en cas de downgrade.
     */
    public function changePlan(Seller $seller, SubscriptionPlan $plan, string $currency = 'USD', ?int $adminId = null, ?string $note = null): Subscription
    {
        return DB::transaction(function () use ($seller, $plan, $currency, $adminId, $note) {
            $currentSub = $this->activeSubscription($seller);
            $currentPlan = $currentSub?->plan;

            $action = 'new';
            if ($currentPlan) {
                $action = match (true) {
                    $plan->sort_order > $currentPlan->sort_order => 'upgrade',
                    $plan->sort_order < $currentPlan->sort_order => 'downgrade',
                    default => 'switch',
                };
            }

            // Montant selon la devise choisie
            $amount = $currency === 'CDF'
                ? (float) ($plan->price_cdf ?? $plan->price)
                : (float) ($plan->price_usd ?? $plan->price);

            // Clôturer l'abonnement actif
            Subscription::where('seller_id', $seller->id)
                ->where('status', 'active')
                ->update(['status' => $action === 'downgrade' ? 'cancelled' : 'expired', 'expires_at' => now()]);

            // Créer le nouvel abonnement
            $newSub = Subscription::create([
                'seller_id' => $seller->id,
                'subscription_plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days ?? 30),
                'amount_paid' => $amount,
                'currency' => $currency,
                'featured_used' => 0,
            ]);

            // Historique
            SubscriptionPlanChange::create([
                'seller_id' => $seller->id,
                'subscription_id' => $newSub->id,
                'from_plan_id' => $currentPlan?->id,
                'to_plan_id' => $plan->id,
                'action' => $action,
                'amount' => $amount,
                'currency' => $currency,
                'note' => $note,
                'changed_by' => $adminId,
            ]);

            // Downgrade : désactiver les produits excédentaires
            if ($plan->product_limit !== null) {
                $this->disableExcessProducts($seller, $newSub, (int) $plan->product_limit, 'downgrade');
            }

            // Réactiver les produits désactivés si le nouveau plan le permet
            $this->reactivateDisabledProducts($seller, $newSub);

            return $newSub;
        });
    }

    /**
     * Désactive les produits au-delà de la limite (les plus anciens d'abord),
     * et notifie le vendeur.
     */
    public function disableExcessProducts(Seller $seller, ?Subscription $sub, int $limit, string $reason): int
    {
        $total = $this->activeProductCount($seller);

        if ($total <= $limit) {
            return 0;
        }

        $excess = $seller->products()
            ->where('status', 'active')
            ->orderBy('created_at')
            ->limit($total - $limit)
            ->pluck('id');

        Product::whereIn('id', $excess)->update(['status' => 'inactive']);

        foreach ($excess as $productId) {
            SubscriptionProductDisable::create([
                'seller_id' => $seller->id,
                'product_id' => $productId,
                'subscription_id' => $sub?->id,
                'reason' => $reason,
            ]);
        }

        Notification::create([
            'user_id' => $seller->user_id,
            'type' => 'subscription',
            'title' => 'Produits désactivés',
            'body' => count($excess)." produit(s) ont été désactivés car votre plan autorise au maximum {$limit} produits actifs. Vous pouvez passer à un plan supérieur ou en supprimer pour réactiver les autres.",
            'action_url' => '/seller/subscriptions',
        ]);

        return count($excess);
    }

    /**
     * Réactive les produits désactivés automatiquement si le plan courant
     * le permet (ordre inverse de désactivation : les plus récents d'abord).
     */
    public function reactivateDisabledProducts(Seller $seller, ?Subscription $sub): int
    {
        $limit = $sub?->plan?->product_limit;

        // Plan illimité ou pas de limite : tout réactiver
        if ($limit === null) {
            $disabled = SubscriptionProductDisable::where('seller_id', $seller->id)
                ->whereNull('reactivated_at')->get();
        } else {
            $currentlyActive = $this->activeProductCount($seller);
            $available = max(0, (int) $limit - $currentlyActive);

            $disabled = SubscriptionProductDisable::where('seller_id', $seller->id)
                ->whereNull('reactivated_at')
                ->orderByDesc('created_at')
                ->limit($available)
                ->get();
        }

        foreach ($disabled as $row) {
            Product::where('id', $row->product_id)->where('status', 'inactive')
                ->update(['status' => 'active']);
            $row->update(['reactivated_at' => now()]);
        }

        return $disabled->count();
    }

    /**
     * Expiration : repasse les abonnés en fin de terme au Gratuit,
     * marque les abonnements expirés, désactive les produits excédentaires.
     */
    public function expireSubscriptions(): array
    {
        $expired = Subscription::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->get();

        $stats = ['expired' => 0, 'downgraded' => 0];

        foreach ($expired as $sub) {
            $seller = $sub->seller;
            if (! $seller) {
                continue;
            }

            $sub->update(['status' => 'expired']);
            $stats['expired']++;

            $gratuit = SubscriptionPlan::active()->where('price', 0)->orderBy('sort_order')->first();

            if ($gratuit) {
                SubscriptionPlanChange::create([
                    'seller_id' => $seller->id,
                    'subscription_id' => $sub->id,
                    'from_plan_id' => $sub->subscription_plan_id,
                    'to_plan_id' => $gratuit->id,
                    'action' => 'expire',
                    'amount' => 0,
                    'currency' => 'USD',
                ]);

                if ($gratuit->product_limit !== null) {
                    $this->disableExcessProducts($seller, null, (int) $gratuit->product_limit, 'expired');
                    $stats['downgraded']++;
                }
            }
        }

        return $stats;
    }
}
