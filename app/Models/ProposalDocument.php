<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalDocument extends Model
{
    protected $fillable = [
        'proposal_id', 'name', 'path', 'mime_type', 'size',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
