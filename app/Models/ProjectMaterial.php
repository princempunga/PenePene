<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMaterial extends Model
{
    protected $fillable = ['project_id', 'name', 'quantity', 'unit', 'source', 'notes'];

    public function project() { return $this->belongsTo(Project::class); }
}
