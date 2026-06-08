<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'seller_id', 'subscription_plan_id', 'status',
        'amount_paid', 'currency', 'payment_reference',
        'starts_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'starts_at'   => 'datetime',
            'expires_at'  => 'datetime',
        ];
    }

    public function scopeActive($q) { return $q->where('status', 'active')->where('expires_at', '>', now()); }

    public function seller() { return $this->belongsTo(Seller::class); }
    public function plan()   { return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id'); }

    public function isExpired(): bool { return $this->expires_at && $this->expires_at->isPast(); }
}
