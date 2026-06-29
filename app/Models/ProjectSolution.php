<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectSolution extends Model
{
    protected $fillable = ['project_constraint_id', 'description', 'status'];

    public function constraint() { return $this->belongsTo(ProjectConstraint::class, 'project_constraint_id'); }
}
