<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectFinalReport extends Model
{
    protected $fillable = [
        'project_id', 'submitted_by', 'body', 'lessons_learned', 'recommendations', 'status', 'submitted_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
    }

    public function project()   { return $this->belongsTo(Project::class); }
    public function submitter() { return $this->belongsTo(User::class, 'submitted_by'); }
}
