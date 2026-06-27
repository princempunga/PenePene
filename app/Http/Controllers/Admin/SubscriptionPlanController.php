<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    use SimulatesData;

    public function index()
    {
        $plans = SubscriptionPlan::orderBy('sort_order')->get();

        $usingDemo = $this->adminDemoEnabled() && $plans->isEmpty();

        if ($usingDemo) {
            $plans = AdminDemoDataService::subscriptionPlans();
        }

        return Inertia::render('Admin/SubscriptionPlans/Index', [
            'plans'         => $plans,
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'currency'      => 'required|string|max:10',
            'billing_cycle' => 'required|in:monthly,yearly',
            'duration_days' => 'required|integer|min:1',
            'features'      => 'nullable|array',
            'sort_order'    => 'integer|min:0',
        ]);

        SubscriptionPlan::create([
            'name'          => $request->name,
            'slug'          => Str::slug($request->name),
            'description'   => $request->description,
            'price'         => $request->price,
            'currency'      => $request->currency,
            'billing_cycle' => $request->billing_cycle,
            'duration_days' => $request->duration_days,
            'features'      => $request->features ? json_encode($request->features) : null,
            'is_active'     => true,
            'sort_order'    => $request->sort_order ?? 0,
        ]);

        return back()->with('success', 'Subscription plan created.');
    }

    public function update(Request $request, SubscriptionPlan $plan)
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'currency'      => 'required|string|max:10',
            'billing_cycle' => 'required|in:monthly,yearly',
            'duration_days' => 'required|integer|min:1',
            'features'      => 'nullable|array',
            'is_active'     => 'boolean',
            'sort_order'    => 'integer|min:0',
        ]);

        $plan->update([
            'name'          => $request->name,
            'description'   => $request->description,
            'price'         => $request->price,
            'currency'      => $request->currency,
            'billing_cycle' => $request->billing_cycle,
            'duration_days' => $request->duration_days,
            'features'      => $request->features ? json_encode($request->features) : $plan->features,
            'is_active'     => $request->boolean('is_active', $plan->is_active),
            'sort_order'    => $request->sort_order ?? $plan->sort_order,
        ]);

        return back()->with('success', 'Subscription plan updated.');
    }

    public function destroy(SubscriptionPlan $plan)
    {
        if ($plan->subscriptions()->where('status', 'active')->exists()) {
            return back()->withErrors(['error' => 'Cannot delete a plan with active subscribers.']);
        }

        $plan->delete();

        return back()->with('success', 'Subscription plan deleted.');
    }
}
