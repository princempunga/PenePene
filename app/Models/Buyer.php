<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Buyer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'address', 'city', 'province', 'country',
        'latitude', 'longitude', 'date_of_birth', 'gender',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'latitude'      => 'decimal:8',
            'longitude'     => 'decimal:8',
        ];
    }

    public function user()         { return $this->belongsTo(User::class); }
    public function orders()       { return $this->hasMany(Order::class); }
    public function reviews()      { return $this->hasMany(Review::class); }
    public function favorites()    { return $this->hasMany(Favorite::class); }
    public function conversations(){ return $this->hasMany(Conversation::class, 'buyer_id', 'user_id'); }

    public function favoriteProducts()
    {
        return $this->belongsToMany(Product::class, 'favorites');
    }
}
