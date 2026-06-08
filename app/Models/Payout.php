<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    protected $fillable = [
        'seller_id', 'amount', 'currency', 'status',
        'payment_method', 'account_number', 'account_name',
        'reference', 'notes', 'requested_at', 'processed_at', 'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'requested_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function seller()      { return $this->belongsTo(Seller::class); }
    public function processedBy() { return $this->belongsTo(User::class, 'processed_by'); }
}
