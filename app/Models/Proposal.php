<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Proposal extends Model
{
    protected $fillable = [
        'user_id', 'proposal_number', 'division_id', 'title', 'summary', 'body',
        'category', 'priority', 'status', 'current_level', 'assigned_to',
        'submitted_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'resolved_at'  => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $proposal) {
            if (empty($proposal->proposal_number)) {
                $proposal->proposal_number = 'PROP-' . strtoupper(Str::random(8));
            }
        });
    }

    public function user()       { return $this->belongsTo(User::class); }
    public function division()   { return $this->belongsTo(AdministrativeDivision::class, 'division_id'); }
    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function documents()  { return $this->hasMany(ProposalDocument::class); }
    public function comments()   { return $this->hasMany(ProposalComment::class)->latest(); }
    public function statusHistories() { return $this->hasMany(ProposalStatusHistory::class)->latest(); }

    public function isEditableBySubmitter(): bool
    {
        return in_array($this->status, ['draft', 'revision_requested']);
    }
}
