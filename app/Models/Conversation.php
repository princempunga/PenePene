<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'buyer_id', 'seller_id', 'product_id', 'last_message_at',
        'buyer_archived', 'seller_archived', 'status',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at'  => 'datetime',
            'buyer_archived'   => 'boolean',
            'seller_archived'  => 'boolean',
        ];
    }

    public function buyer()    { return $this->belongsTo(User::class, 'buyer_id'); }
    public function seller()   { return $this->belongsTo(Seller::class, 'seller_id'); }
    public function product()  { return $this->belongsTo(Product::class)->withTrashed(); }
    public function messages() { return $this->hasMany(Message::class)->orderBy('created_at'); }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function userStates()
    {
        return $this->hasMany(ConversationUserState::class);
    }

    public function unreadCount(int $userId): int
    {
        return $this->messages()->where('sender_id', '!=', $userId)->whereNull('read_at')->count();
    }
}
