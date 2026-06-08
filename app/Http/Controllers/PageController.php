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
        $plans = SubscriptionPlan::active()->get();
        return Inertia::render('Static/Pricing', [
            'plans' => $plans
        ]);
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
