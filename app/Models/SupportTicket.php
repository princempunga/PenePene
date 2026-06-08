<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id', 'ticket_number', 'subject', 'body',
        'category', 'priority', 'status',
        'assigned_to', 'resolved_at', 'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'closed_at'   => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $ticket) {
            $ticket->ticket_number = 'TKT-' . strtoupper(Str::random(8));
        });
    }

    public function user()       { return $this->belongsTo(User::class); }
    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function replies()    { return $this->hasMany(SupportTicketReply::class, 'ticket_id')->latest(); }
}
