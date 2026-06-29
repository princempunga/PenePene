<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectPersonnel extends Model
{
    protected $table = 'project_personnel';

    protected $fillable = ['project_id', 'role_title', 'count', 'source', 'notes'];

    public function project() { return $this->belongsTo(Project::class); }
}
