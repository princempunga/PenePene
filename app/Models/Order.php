<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number', 'buyer_id', 'seller_id', 'status',
        'payment_status', 'payment_method', 'paid_at',
        'subtotal', 'total', 'currency',
        'delivery_address', 'delivery_city', 'delivery_province', 'delivery_country',
        'buyer_notes', 'seller_notes', 'rejection_reason',
        'confirmed_at', 'delivered_at',
    ];

    protected $appends = [
        'total_amount',
        'shipping_address',
        'shipping_cost',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'     => 'decimal:2',
            'total'        => 'decimal:2',
            'confirmed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'paid_at'      => 'datetime',
        ];
    }

    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->attributes['total_amount'] ?? $this->attributes['total'] ?? 0);
    }

    public function getShippingAddressAttribute(): ?string
    {
        return $this->delivery_address;
    }

    public function getShippingCostAttribute(): string
    {
        return '0';
    }

    protected static function booted(): void
    {
        static::creating(function (self $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(uniqid());
            }
        });
    }

    // Scopes
    public function scopePending($q)   { return $q->where('status', 'pending'); }
    public function scopeConfirmed($q) { return $q->where('status', 'confirmed'); }

    // Relationships
    public function buyer()     { return $this->belongsTo(Buyer::class); }
    public function seller()    { return $this->belongsTo(Seller::class); }
    public function items()     { return $this->hasMany(OrderItem::class); }
    public function review()    { return $this->hasOne(Review::class); }
}
