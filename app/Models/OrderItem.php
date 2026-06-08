<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'product_name', 'price', 'quantity', 'subtotal',
    ];

    protected $appends = ['unit_price', 'total_price'];

    protected function casts(): array
    {
        return [
            'price'    => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function getUnitPriceAttribute(): string
    {
        return $this->price;
    }

    public function getTotalPriceAttribute(): string
    {
        return $this->subtotal;
    }

    public function order()   { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class)->withTrashed(); }
}
