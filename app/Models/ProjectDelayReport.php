<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectDelayReport extends Model
{
    protected $fillable = [
        'project_task_id', 'user_id', 'reason', 'reported_before_deadline', 'new_planned_end', 'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'reported_before_deadline' => 'boolean',
            'new_planned_end'          => 'date',
        ];
    }

    public function task()     { return $this->belongsTo(ProjectTask::class, 'project_task_id'); }
    public function user()     { return $this->belongsTo(User::class); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
}
