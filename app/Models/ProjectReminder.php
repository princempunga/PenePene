<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectReminder extends Model
{
    protected $fillable = [
        'project_id', 'project_task_id', 'user_id', 'type', 'due_at', 'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'due_at'  => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function project() { return $this->belongsTo(Project::class); }
    public function task()    { return $this->belongsTo(ProjectTask::class, 'project_task_id'); }
    public function user()    { return $this->belongsTo(User::class); }
}
