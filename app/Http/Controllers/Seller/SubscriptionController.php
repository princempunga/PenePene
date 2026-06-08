<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

        return Inertia::render('Seller/Subscriptions/Index', [
            'seller'  => $seller,
            'plans'   => $plans,
            'history' => $history,
        ]);
    }

    public function subscribe(Request $request, SubscriptionPlan $plan)
    {
        $seller = $this->seller();

        // Cancel any existing active subscription
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

        return back()->with('success', "You are now subscribed to the {$plan->name} plan!");
    }
}
