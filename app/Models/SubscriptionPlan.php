<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'currency',
        'billing_cycle', 'duration_days', 'features',
        'is_active', 'is_featured', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price'       => 'decimal:2',
            'features'    => 'array',
            'is_active'   => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function scopeActive($q) { return $q->where('is_active', true)->orderBy('sort_order'); }

    public function subscriptions() { return $this->hasMany(Subscription::class, 'subscription_plan_id'); }

    public function getRouteKeyName(): string { return 'slug'; }
}
