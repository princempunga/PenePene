<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepagePromotion extends Model
{
    protected $fillable = [
        'seller_id',
        'product_id',
        'product_ids',
        'custom_image_url',
        'headline',
        'promotion_order',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'product_ids' => 'array',
            'starts_at'  => 'datetime',
            'ends_at'    => 'datetime',
        ];
    }

    /**
     * Active promotions: enabled, within date range (or no date range set).
     */
    public function scopeActive($q)
    {
        return $q->where('is_active', true)
                  ->where(function ($q2) {
                      $q2->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                  })
                  ->where(function ($q2) {
                      $q2->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                  });
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
