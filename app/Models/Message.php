<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id', 'sender_id', 'receiver_id', 'reply_to_message_id',
        'message_type', 'body',
        'attachment_path', 'attachment_mime', 'attachment_size',
        'is_read', 'read_at', 'is_edited', 'edited_at', 'is_deleted', 'deleted_at',
        'deleted_for',
    ];

    protected function casts(): array
    {
        return [
            'is_read'     => 'boolean',
            'read_at'     => 'datetime',
            'is_edited'   => 'boolean',
            'edited_at'   => 'datetime',
            'is_deleted'  => 'boolean',
            'deleted_at'  => 'datetime',
            'deleted_for' => 'array',
        ];
    }

    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function sender()       { return $this->belongsTo(User::class, 'sender_id'); }
    public function receiver()     { return $this->belongsTo(User::class, 'receiver_id'); }
    public function replyTo()      { return $this->belongsTo(Message::class, 'reply_to_message_id'); }
    public function reactions()    { return $this->hasMany(MessageReaction::class); }
    public function stars()        { return $this->hasMany(StarredMessage::class); }

    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }
    }

    public function isDeletedFor(int $userId): bool
    {
        return in_array($userId, $this->deleted_for ?? []);
    }
}

