<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalDocument extends Model
{
    protected $fillable = [
        'proposal_id', 'name', 'path', 'disk', 'mime_type', 'size',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
