<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectInterest extends Model
{
    protected $fillable = ['project_id', 'type', 'description', 'sort_order'];

    public function project() { return $this->belongsTo(Project::class); }
}
