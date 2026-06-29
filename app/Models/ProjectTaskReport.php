<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTaskReport extends Model
{
    protected $fillable = [
        'project_task_id', 'user_id', 'body', 'is_on_time', 'delay_justification',
    ];

    protected function casts(): array
    {
        return ['is_on_time' => 'boolean'];
    }

    public function task() { return $this->belongsTo(ProjectTask::class, 'project_task_id'); }
    public function user() { return $this->belongsTo(User::class); }
}
