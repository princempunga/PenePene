<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index()
    {
        $seller = $this->seller()->load('activeSubscription.plan');
        $plans  = SubscriptionPlan::where('is_active', true)->orderBy('sort_order')->get();
        $history = Subscription::with('plan')
            ->where('seller_id', $seller->id)
            ->latest()
            ->get();

        $activeSub = $seller->activeSubscription;
        $currentPlan = $activeSub?->plan;

        return Inertia::render('Seller/Subscriptions/Index', [
            'seller'       => $seller,
            'plans'        => $plans,
            'history'      => $history,
            'currentPlan'  => $currentPlan,
            'billingStatus' => $this->resolveBillingStatus($activeSub),
        ]);
    }

    public function subscribe(Request $request, SubscriptionPlan $plan)
    {
        if (! $plan->is_active) {
            return back()->with('error', 'Ce plan n\'est plus disponible.');
        }

        $seller = $this->seller()->load('activeSubscription.plan');
        $currentPlan = $seller->activeSubscription?->plan;
        $action = $this->resolvePlanAction($currentPlan, $plan);

        Subscription::where('seller_id', $seller->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled', 'expires_at' => now()]);

        $startsAt  = Carbon::now();
        $expiresAt = $startsAt->copy()->addDays($plan->duration_days);

        Subscription::create([
            'seller_id'            => $seller->id,
            'subscription_plan_id' => $plan->id,
            'status'               => 'active',
            'starts_at'            => $startsAt,
            'expires_at'           => $expiresAt,
            'amount_paid'          => $plan->price,
            'currency'             => 'CDF',
        ]);

        return back()->with('success', match ($action) {
            'upgrade'   => "Passage au plan {$plan->name} effectué avec succès !",
            'downgrade' => "Passage au plan {$plan->name} effectué.",
            default     => "Vous êtes maintenant abonné au plan {$plan->name} !",
        });
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
}
