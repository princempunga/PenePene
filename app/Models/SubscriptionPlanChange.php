<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlanChange extends Model
{
    protected $fillable = [
        'seller_id', 'subscription_id',
        'from_plan_id', 'to_plan_id', 'action',
        'amount', 'currency', 'payment_reference',
        'note', 'changed_by',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function fromPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'from_plan_id');
    }

    public function toPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'to_plan_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
