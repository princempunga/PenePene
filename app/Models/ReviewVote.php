<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewVote extends Model
{
    protected $fillable = ['review_id', 'user_id', 'is_helpful'];

    protected function casts(): array
    {
        return [
            'is_helpful' => 'boolean',
        ];
    }

    public function review() { return $this->belongsTo(Review::class); }
    public function user() { return $this->belongsTo(User::class); }
}
