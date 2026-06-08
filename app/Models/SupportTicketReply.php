<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicketReply extends Model
{
    protected $fillable = [
        'ticket_id', 'user_id', 'body', 'is_staff_reply',
    ];

    protected function casts(): array
    {
        return [
            'is_staff_reply' => 'boolean',
        ];
    }

    public function ticket() { return $this->belongsTo(SupportTicket::class); }
    public function user()   { return $this->belongsTo(User::class); }
}
