<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SponsoredProduct extends Model
{
    protected $fillable = [
        'product_id', 'seller_id', 'placement',
        'amount_paid', 'currency', 'status',
        'starts_at', 'expires_at',
        'impression_count', 'click_count',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'starts_at'   => 'datetime',
            'expires_at'  => 'datetime',
        ];
    }

    public function scopeActive($q)
    {
        return $q->where('status', 'active')
                 ->where('starts_at', '<=', now())
                 ->where('expires_at', '>=', now());
    }

    public function scopeForPlacement($q, string $placement)
    {
        return $q->where('placement', $placement);
    }

    public function product() { return $this->belongsTo(Product::class)->withTrashed(); }
    public function seller()  { return $this->belongsTo(Seller::class); }
}
