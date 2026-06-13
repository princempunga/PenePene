<?php

namespace App\Models;

use App\Support\Translations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'avatar', 'is_active', 'locale', 'is_online', 'last_seen_at'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'is_online'         => 'boolean',
            'last_seen_at'      => 'datetime',
        ];
    }

    public function getLastSeenText(): string
    {
        if ($this->is_online && $this->last_seen_at && $this->last_seen_at->diffInMinutes(now()) < 5) {
            return Translations::get('chat_ext.online_now', $this->locale);
        }

        if (! $this->last_seen_at) {
            return Translations::get('chat.offline', $this->locale);
        }

        return Translations::get('chat.last_seen', $this->locale).' '.$this->last_seen_at->locale($this->locale ?? app()->getLocale())->diffForHumans();
    }

    // Role helpers
    public function isSuperAdmin(): bool { return $this->role === 'super_admin'; }
    public function isAdmin(): bool      { return in_array($this->role, ['admin', 'super_admin']); }
    public function isSeller(): bool     { return $this->role === 'seller'; }
    public function isBuyer(): bool      { return $this->role === 'buyer'; }

    // Relationships
    public function seller() { return $this->hasOne(Seller::class); }
    public function buyer()  { return $this->hasOne(Buyer::class); }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function productViews()
    {
        return $this->hasMany(ProductView::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->notifications()->where('is_read', false);
    }
}
