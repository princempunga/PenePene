<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerReport extends Model
{
    protected $fillable = [
        'reporter_id', 'reported_seller_id', 'category', 'description',
        'evidence_files', 'status', 'admin_notes', 'resolved_at', 'resolved_by'
    ];

    protected function casts(): array
    {
        return [
            'evidence_files' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function reporter() { return $this->belongsTo(User::class, 'reporter_id'); }
    public function reportedSeller() { return $this->belongsTo(Seller::class, 'reported_seller_id'); }
    public function resolvedBy() { return $this->belongsTo(User::class, 'resolved_by'); }
}
