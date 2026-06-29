<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id', 'category_id', 'subcategory_id',
        'name', 'slug', 'description', 'short_description',
        'price', 'sale_price', 'currency', 'unit',
        'initial_stock', 'confirmed_sales', 'low_stock_threshold',
        'city', 'province', 'country', 'latitude', 'longitude',
        'status', 'is_featured', 'priority_position', 'sponsored_until', 'promotion_status', 'allow_contact',
        'meta_title', 'meta_description',
        'view_count', 'average_rating', 'total_reviews',
    ];

    protected function casts(): array
    {
        return [
            'price'          => 'decimal:2',
            'sale_price'     => 'decimal:2',
            'average_rating' => 'decimal:2',
            'is_featured'       => 'boolean',
            'sponsored_until'   => 'datetime',
            'allow_contact'     => 'boolean',
            'latitude'       => 'decimal:8',
            'longitude'      => 'decimal:8',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name) . '-' . Str::random(6);
            }
            if (empty($product->currency)) {
                $product->currency = 'CDF';
            }
        });
    }

    // Scopes
    public function scopeActive($q)    { return $q->where('status', 'active'); }
    public function scopeFeatured($q)  { return $q->where('is_featured', true); }
    public function scopeInStock($q)   { return $q->whereRaw('(initial_stock - confirmed_sales) > 0'); }

    /** Produits mis en avant actifs (priorité sous-catégorie). */
    public function scopePromoted($q)
    {
        return $q->where('promotion_status', 'active')
            ->where(function ($q2) {
                $q2->whereNull('sponsored_until')
                   ->orWhere('sponsored_until', '>', now());
            });
    }

    public function scopeNearby($q, $lat, $lng, $radiusKm = 50)
    {
        return $q->selectRaw(
            '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
            [$lat, $lng, $lat]
        )->having('distance', '<', $radiusKm)->orderBy('distance');
    }

    public function scopeSearch($q, string $keyword)
    {
        return $q->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
              ->orWhere('description', 'like', "%{$keyword}%");
        });
    }

    // Computed attributes
    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->initial_stock - $this->confirmed_sales);
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    public function getPrimaryImageAttribute(): ?string
    {
        return $this->images()->where('is_primary', true)->value('image_path')
            ?? $this->images()->value('image_path');
    }

    public function isInStock(): bool { return $this->available_stock > 0; }
    public function isLowStock(): bool
    {
        return $this->available_stock > 0 && $this->available_stock <= $this->low_stock_threshold;
    }

    // Relationships
    public function seller()      { return $this->belongsTo(Seller::class); }
    public function category()    { return $this->belongsTo(Category::class); }
    public function subcategory() { return $this->belongsTo(Subcategory::class); }
    public function images()      { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function views()       { return $this->hasMany(ProductView::class); }
    public function orderItems()  { return $this->hasMany(OrderItem::class); }
    public function favoritedBy() { return $this->hasMany(Favorite::class); }
    public function sponsored()   { return $this->hasMany(SponsoredProduct::class); }
    public function reviews()     { return $this->hasMany(Review::class); }

    public function getRouteKeyName(): string { return 'slug'; }
}
