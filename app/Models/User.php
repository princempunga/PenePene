<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'avatar', 'is_active', 'locale',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
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

    public function productViews()
    {
        return $this->hasMany(ProductView::class);
    }
}
