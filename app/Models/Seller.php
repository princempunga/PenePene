<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Seller extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'business_name', 'slug', 'logo', 'banner', 'description',
        'phone', 'whatsapp', 'email', 'website', 'business_hours',
        'address', 'neighborhood', 'municipality', 'city', 'province', 'country',
        'latitude', 'longitude',
        'status', 'rejection_reason', 'verified_at', 'verified_by',
        'average_rating', 'total_reviews', 'total_sales', 'total_views',
        'meta_title', 'meta_description',
        'strikes', 'trust_score', 'response_rate', 'response_time_minutes',
    ];

    protected $appends = ['is_verified', 'trust_badges'];

    protected function casts(): array
    {
        return [
            'verified_at'     => 'datetime',
            'average_rating'  => 'decimal:2',
            'latitude'        => 'decimal:8',
            'longitude'       => 'decimal:8',
            'business_hours'  => 'array',
            'trust_score'     => 'decimal:2',
            'response_rate'   => 'decimal:2',
        ];
    }

    public function getIsVerifiedAttribute(): bool
    {
        return $this->status === 'verified';
    }

    public function getTrustBadgesAttribute(): array
    {
        $badges = [];

        // New Seller: Account age < 30 days
        if ($this->created_at && $this->created_at->diffInDays(now()) < 30) {
            $badges[] = 'New Seller';
        }

        // Verified Seller
        if ($this->status === 'verified') {
            $badges[] = 'Verified Seller';
        }

        // Premium Seller
        if ($this->isPremium()) {
            $badges[] = 'Premium Seller';
        }

        // Top Rated Seller
        if ($this->total_reviews >= 100 && $this->average_rating >= 4.8 && $this->strikes == 0) {
            $badges[] = 'Top Rated Seller';
        } elseif ($this->total_reviews >= 50 && $this->average_rating >= 4.5 && $this->strikes == 0) {
            // Trusted Seller
            $badges[] = 'Trusted Seller';
        }

        // Recommended Seller (arbitrary criteria: response rate > 95% and fast response time)
        if ($this->total_reviews >= 10 && $this->average_rating >= 4.0 && $this->response_rate >= 95 && $this->response_time_minutes <= 120 && $this->strikes == 0) {
            $badges[] = 'Recommended Seller';
        }

        return $badges;
    }

    protected static function booted(): void
    {
        static::creating(function (self $seller) {
            if (empty($seller->slug)) {
                $seller->slug = Str::slug($seller->business_name);
            }
        });
    }

    // Scopes
    public function scopeVerified($q)   { return $q->where('status', 'verified'); }
    public function scopeActive($q)     { return $q->where('status', 'verified'); }
    public function scopeNearby($q, $lat, $lng, $radiusKm = 50)
    {
        return $q->selectRaw(
            '*, ( 6371 * acos( cos( radians(?) ) * cos( radians(latitude) ) * cos( radians(longitude) - radians(?) ) + sin( radians(?) ) * sin( radians(latitude) ) ) ) AS distance',
            [$lat, $lng, $lat]
        )->having('distance', '<', $radiusKm)->orderBy('distance');
    }

    // Relationships
    public function user()          { return $this->belongsTo(User::class); }
    public function products()      { return $this->hasMany(Product::class); }
    public function reviews()       { return $this->hasMany(Review::class); }
    public function orders()        { return $this->hasMany(Order::class); }
    public function conversations() { return $this->hasMany(Conversation::class); }
    public function documents()     { return $this->hasMany(SellerDocument::class); }
    public function subscriptions() { return $this->hasMany(Subscription::class); }
    public function sponsoredProducts() { return $this->hasMany(SponsoredProduct::class); }
    public function commissions()       { return $this->hasMany(Commission::class); }
    public function payouts()           { return $this->hasMany(Payout::class); }
    public function reports()           { return $this->hasMany(SellerReport::class, 'reported_seller_id'); }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latest('expires_at');
    }

    public function isPremium(): bool
    {
        return $this->activeSubscription()->exists() &&
               optional($this->activeSubscription->plan)->slug === 'premium';
    }

    // Helpers
    public function getAvailableStock(Product $product): int
    {
        return max(0, $product->initial_stock - $product->confirmed_sales);
    }

    public function getRouteKeyName(): string { return 'slug'; }
}
