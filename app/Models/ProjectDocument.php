<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectDocument extends Model
{
    protected $fillable = [
        'project_id', 'project_task_id', 'uploaded_by', 'type', 'stage',
        'name', 'path', 'mime_type', 'size',
    ];

    public function project() { return $this->belongsTo(Project::class); }
    public function task()    { return $this->belongsTo(ProjectTask::class, 'project_task_id'); }
    public function uploader(){ return $this->belongsTo(User::class, 'uploaded_by'); }
}
