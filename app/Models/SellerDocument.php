<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerDocument extends Model
{
    protected $fillable = [
        'seller_id', 'document_type', 'document_file',
        'document_number', 'status', 'rejection_reason',
        'verified_at', 'verified_by',
    ];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime'];
    }

    public function seller()     { return $this->belongsTo(Seller::class); }
    public function verifiedBy() { return $this->belongsTo(User::class, 'verified_by'); }
}
