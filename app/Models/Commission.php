<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'order_id', 'order_item_id', 'seller_id',
        'order_amount', 'commission_rate', 'commission_amount', 'seller_payout',
        'currency', 'status', 'paid_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'order_amount'      => 'decimal:2',
            'commission_rate'   => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'seller_payout'     => 'decimal:2',
            'paid_at'           => 'datetime',
        ];
    }

    public function order()     { return $this->belongsTo(Order::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
    public function seller()    { return $this->belongsTo(Seller::class); }
}
