<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'buyer_id', 'seller_id', 'order_id', 'rating',
        'title', 'comment', 'is_approved', 'seller_reply', 'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'rating'      => 'integer',
            'is_approved' => 'boolean',
            'replied_at'  => 'datetime',
        ];
    }

    public function scopeApproved($q) { return $q->where('is_approved', true); }

    public function buyer()  { return $this->belongsTo(Buyer::class); }
    public function seller() { return $this->belongsTo(Seller::class); }
    public function order()  { return $this->belongsTo(Order::class)->withTrashed(); }
}
