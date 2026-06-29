<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectConstraint extends Model
{
    protected $fillable = ['project_id', 'type', 'description'];

    public function project()  { return $this->belongsTo(Project::class); }
    public function solutions(){ return $this->hasMany(ProjectSolution::class); }
}
