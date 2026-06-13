<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SubscriptionPlan;

class PageController extends Controller
{
    public function about()
    {
        return Inertia::render('Static/About');
    }

    public function contact()
    {
        return Inertia::render('Static/Contact');
    }

    public function faq()
    {
        return Inertia::render('Static/FAQ');
    }

    public function pricing()
    {
        $plans = SubscriptionPlan::active()->get()->map(function ($plan) {
            $features = $plan->features;
            if (is_string($features)) {
                $features = json_decode($features, true) ?? [];
            }

            return [
                'id'            => $plan->id,
                'name'          => $plan->name,
                'slug'          => $plan->slug,
                'description'   => $plan->description,
                'price'         => $plan->price,
                'currency'      => $plan->currency,
                'billing_cycle' => $plan->billing_cycle,
                'is_featured'   => $plan->is_featured,
                'features'      => is_array($features) ? $features : [],
            ];
        });

        return Inertia::render('Static/Pricing', [
            'plans' => $plans,
        ]);
    }

    public function sellerResources()
    {
        return Inertia::render('Static/SellerResources');
    }

    public function communityForum()
    {
        return Inertia::render('Static/CommunityForum');
    }

    public function blog()
    {
        return Inertia::render('Static/Blog');
    }

    public function cookies()
    {
        return Inertia::render('Static/Cookies');
    }

    public function becomeSeller()
    {
        return Inertia::render('Static/BecomeSeller');
    }

    public function terms()
    {
        return Inertia::render('Static/Terms');
    }

    public function privacy()
    {
        return Inertia::render('Static/Privacy');
    }

    public function helpCenter()
    {
        return Inertia::render('Static/HelpCenter');
    }
}
