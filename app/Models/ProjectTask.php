<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTask extends Model
{
    protected $fillable = [
        'project_id', 'title', 'description', 'importance', 'duration_days',
        'planned_start', 'planned_end', 'actual_start', 'actual_end',
        'step_mode', 'responsible_user_id', 'responsible_name', 'status', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'planned_start' => 'date',
            'planned_end'   => 'date',
            'actual_start'  => 'date',
            'actual_end'    => 'date',
        ];
    }

    public function project()       { return $this->belongsTo(Project::class); }
    public function responsible()   { return $this->belongsTo(User::class, 'responsible_user_id'); }
    public function members()       { return $this->hasMany(ProjectTaskMember::class); }
    public function reports()       { return $this->hasMany(ProjectTaskReport::class)->latest(); }
    public function delayReports()  { return $this->hasMany(ProjectDelayReport::class)->latest(); }
    public function documents()     { return $this->hasMany(ProjectDocument::class); }

    public function isOverdue(): bool
    {
        return $this->planned_end
            && ! in_array($this->status, ['completed'])
            && $this->planned_end->isPast();
    }

    public function syncOverdueStatus(): void
    {
        if ($this->isOverdue() && $this->status !== 'delayed') {
            $this->update(['status' => 'overdue']);
        }
    }
}
