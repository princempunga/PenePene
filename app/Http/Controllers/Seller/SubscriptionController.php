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
            return back()->with('error', 'This plan is no longer available.');
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
            'currency'             => $plan->currency,
        ]);

        return back()->with('success', match ($action) {
            'upgrade'   => "Upgraded to {$plan->name} successfully!",
            'downgrade' => "Switched to {$plan->name} successfully.",
            default     => "You are now subscribed to the {$plan->name} plan!",
        });
    }

    protected function resolveBillingStatus(?Subscription $subscription): array
    {
        if (! $subscription) {
            return [
                'label'  => 'No active plan',
                'status' => 'none',
                'detail' => 'Subscribe to a plan to unlock seller features.',
            ];
        }

        if ($subscription->isExpired()) {
            return [
                'label'  => 'Expired',
                'status' => 'expired',
                'detail' => 'Your subscription expired on ' . $subscription->expires_at->format('M j, Y') . '.',
            ];
        }

        $daysLeft = (int) now()->diffInDays($subscription->expires_at, false);

        if ($daysLeft <= 7) {
            return [
                'label'  => 'Expiring soon',
                'status' => 'warning',
                'detail' => "Renews in {$daysLeft} day" . ($daysLeft === 1 ? '' : 's') . '.',
            ];
        }

        return [
            'label'  => 'Active',
            'status' => 'active',
            'detail' => 'Next billing date: ' . $subscription->expires_at->format('M j, Y') . '.',
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
