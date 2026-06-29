<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalComment extends Model
{
    protected $fillable = [
        'proposal_id', 'user_id', 'body', 'is_official', 'visibility',
    ];

    protected function casts(): array
    {
        return [
            'is_official' => 'boolean',
        ];
    }

    public function proposal() { return $this->belongsTo(Proposal::class); }
    public function user()     { return $this->belongsTo(User::class); }
}
