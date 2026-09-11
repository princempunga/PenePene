<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function __construct(protected \App\Services\SubscriptionService $subscriptions)
    {
    }
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index()
    {
        return $this->indexV2();
    }

    public function subscribe(Request $request, SubscriptionPlan $plan)
    {
        return $this->subscribeV2($request, $plan);
    }

    protected function resolveBillingStatus(?Subscription $subscription): array
    {
        if (! $subscription) {
            return [
                'label'  => 'Aucun plan actif',
                'status' => 'none',
                'detail' => 'Abonnez-vous à un plan pour débloquer les fonctionnalités vendeur.',
            ];
        }

        if ($subscription->isExpired()) {
            return [
                'label'  => 'Expiré',
                'status' => 'expired',
                'detail' => 'Votre abonnement a expiré le ' . $subscription->expires_at->locale('fr')->isoFormat('D MMMM YYYY') . '.',
            ];
        }

        $daysLeft = (int) now()->diffInDays($subscription->expires_at, false);

        if ($daysLeft <= 7) {
            return [
                'label'  => 'Expire bientôt',
                'status' => 'warning',
                'detail' => "Renouvellement dans {$daysLeft} jour" . ($daysLeft === 1 ? '' : 's') . '.',
            ];
        }

        return [
            'label'  => 'Actif',
            'status' => 'active',
            'detail' => 'Prochaine date de facturation : ' . $subscription->expires_at->locale('fr')->isoFormat('D MMMM YYYY') . '.',
        ];
    }

    protected function resolvePlanAction(?SubscriptionPlan $current, SubscriptionPlan $newPlan): string
    {
        if (! $current) {
            return 'subscribe';
        }

        if ($newPlan->sort_order > $current->sort_order || $newPlan->price > $current->price) {
            return 'upgrade';
        }

        if ($newPlan->sort_order < $current->sort_order || $newPlan->price < $current->price) {
            return 'downgrade';
        }

        return 'subscribe';
    }

    // ================= V2 : module abonnements complet (USD/CDF) =================

    public function indexV2()
    {
    $seller = $this->seller()->load('activeSubscription.plan');
    $plans  = SubscriptionPlan::active()->orderBy('sort_order')->get();

    $history = SubscriptionPlanChange::with(['fromPlan', 'toPlan'])
        ->where('seller_id', $seller->id)
        ->latest()
        ->limit(20)
        ->get();

    $activeSub = $seller->activeSubscription;

    return Inertia::render('Seller/Subscriptions/Index', [
        'plans'        => $plans,
        'history'      => $history,
        'currentPlan'  => $this->subscriptions->effectivePlan($seller),
        'activeSub'    => $activeSub,
        'billingStatus' => $this->resolveBillingStatus($activeSub),
        'usage'        => $this->usage($seller),
    ]);
}

/**
 * Souscription / changement de plan avec devise choisie.
 */
public function subscribeV2(Request $request, SubscriptionPlan $plan)
{
    if (! $plan->is_active) {
        return back()->with('error', "Ce plan n'est plus disponible.");
    }

    $currency = $request->input('currency', 'USD');
    if (! in_array($currency, ['USD', 'CDF'], true)) {
        return back()->with('error', 'Devise invalide.');
    }

    // Un plan gratuit ne nécessite pas de devise
    if ((float) $plan->price_usd == 0) {
        $currency = 'USD';
    } elseif ($currency === 'USD' && ! $plan->price_usd) {
        return back()->with('error', 'Ce plan ne supporte pas la devise sélectionnée.');
    } elseif ($currency === 'CDF' && ! $plan->price_cdf) {
        return back()->with('error', 'Ce plan ne supporte pas la devise sélectionnée.');
    }

    $seller = $this->seller();
    $currentPlan = $this->subscriptions->effectivePlan($seller);
    $action = $this->resolvePlanAction($currentPlan, $plan);

    $this->subscriptions->changePlan($seller, $plan, $currency);

    return back()->with('success', match ($action) {
        'upgrade'   => "Passage au plan {$plan->name} effectué avec succès !",
        'downgrade' => "Passage au plan {$plan->name} effectué. Les produits excédentaires ont été désactivés si nécessaire.",
        default     => "Vous êtes maintenant abonné au plan {$plan->name} !",
    });
}

/**
 * Usage courant : produits et mises en avant.
 */
protected function usage($seller): array
{
    $plan = $this->subscriptions->effectivePlan($seller);
    $used = $this->subscriptions->activeProductCount($seller);
    $feat = $this->subscriptions->featuredUsage($seller);

    return [
        'products' => [
            'used'      => $used,
            'limit'     => $plan->product_limit,
            'unlimited' => $plan->product_limit === null,
            'label'     => $plan->product_limit === null ? "{$used} produits (illimité)" : "{$used}/{$plan->product_limit} produits utilisés",
        ],
        'featured' => $feat,
    ];
    }
}
