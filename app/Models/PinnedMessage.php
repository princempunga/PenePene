<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PinnedMessage extends Model
{
    protected $fillable = ['conversation_id', 'message_id', 'pinned_by'];

    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function message()      { return $this->belongsTo(Message::class); }
    public function pinnedByUser() { return $this->belongsTo(User::class, 'pinned_by'); }
}

