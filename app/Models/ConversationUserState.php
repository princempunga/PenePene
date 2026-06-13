<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationUserState extends Model
{
    protected $fillable = [
        'conversation_id', 'user_id', 'deleted_at', 'cleared_at', 'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'deleted_at'  => 'datetime',
            'cleared_at'  => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function user()         { return $this->belongsTo(User::class); }

    public static function forUser(Conversation $conversation, int $userId): self
    {
        return self::firstOrCreate([
            'conversation_id' => $conversation->id,
            'user_id'         => $userId,
        ]);
    }
}
