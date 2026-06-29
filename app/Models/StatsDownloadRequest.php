<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StatsDownloadRequest extends Model
{
    protected $fillable = [
        'seller_id', 'report_type', 'format', 'date_from', 'date_to',
        'status', 'reviewed_by', 'reviewed_at', 'rejection_reason',
        'download_token', 'downloaded_at',
        'billing_amount', 'billing_status', 'billing_reference',
    ];

    protected function casts(): array
    {
        return [
            'date_from'      => 'date',
            'date_to'        => 'date',
            'reviewed_at'    => 'datetime',
            'downloaded_at'  => 'datetime',
            'billing_amount' => 'decimal:2',
        ];
    }

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public function seller()    { return $this->belongsTo(Seller::class); }
    public function reviewer()  { return $this->belongsTo(User::class, 'reviewed_by'); }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function canDownload(): bool
    {
        return $this->isApproved() && $this->download_token !== null;
    }

    public function generateDownloadToken(): string
    {
        $this->download_token = Str::random(64);
        $this->save();

        return $this->download_token;
    }
}
