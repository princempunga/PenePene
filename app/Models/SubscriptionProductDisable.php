<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionProductDisable extends Model
{
    protected $fillable = [
        'seller_id', 'product_id', 'subscription_id',
        'reason', 'reactivated_at',
    ];

    protected function casts(): array
    {
        return ['reactivated_at' => 'datetime'];
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
