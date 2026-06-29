<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectStatusHistory extends Model
{
    protected $fillable = [
        'project_id', 'user_id', 'from_status', 'to_status', 'from_stage', 'to_stage', 'note',
    ];

    public function project() { return $this->belongsTo(Project::class); }
    public function user()    { return $this->belongsTo(User::class); }
}
