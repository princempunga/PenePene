<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalStatusHistory extends Model
{
    protected $fillable = [
        'proposal_id', 'user_id', 'from_status', 'to_status',
        'from_level', 'to_level', 'note',
    ];

    public function proposal() { return $this->belongsTo(Proposal::class); }
    public function user()     { return $this->belongsTo(User::class); }
}
