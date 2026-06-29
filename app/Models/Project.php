<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'user_id', 'project_number', 'division_id', 'title', 'category', 'status', 'stage',
        'project_manager_id', 'planned_duration_days', 'planned_start_date', 'planned_end_date',
        'actual_start_date', 'actual_end_date', 'submitted_at', 'expert_review_deadline',
        'expert_reviewed_at', 'approved_at', 'tutelage_submitted_at', 'completed_at',
        'lessons_learned', 'evaluation_notes', 'is_public', 'copied_from_project_id',
    ];

    protected function casts(): array
    {
        return [
            'planned_start_date'      => 'date',
            'planned_end_date'        => 'date',
            'actual_start_date'       => 'date',
            'actual_end_date'         => 'date',
            'submitted_at'            => 'datetime',
            'expert_review_deadline'  => 'datetime',
            'expert_reviewed_at'      => 'datetime',
            'approved_at'             => 'datetime',
            'tutelage_submitted_at'   => 'datetime',
            'completed_at'            => 'datetime',
            'is_public'               => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $project) {
            if (empty($project->project_number)) {
                $project->project_number = 'PRJ-' . strtoupper(Str::random(8));
            }
        });
    }

    public function user()              { return $this->belongsTo(User::class); }
    public function projectManager()    { return $this->belongsTo(User::class, 'project_manager_id'); }
    public function division()          { return $this->belongsTo(AdministrativeDivision::class, 'division_id'); }
    public function copiedFrom()        { return $this->belongsTo(self::class, 'copied_from_project_id'); }
    public function interests()         { return $this->hasMany(ProjectInterest::class)->orderBy('sort_order'); }
    public function budget()            { return $this->hasOne(ProjectBudget::class); }
    public function tasks()             { return $this->hasMany(ProjectTask::class)->orderBy('sort_order'); }
    public function materials()         { return $this->hasMany(ProjectMaterial::class); }
    public function personnel()         { return $this->hasMany(ProjectPersonnel::class); }
    public function constraints()       { return $this->hasMany(ProjectConstraint::class); }
    public function expertReviews()     { return $this->hasMany(ProjectExpertReview::class); }
    public function tutelageRecord()    { return $this->hasOne(ProjectTutelageRecord::class); }
    public function documents()         { return $this->hasMany(ProjectDocument::class); }
    public function finalReport()       { return $this->hasOne(ProjectFinalReport::class); }
    public function statusHistories()   { return $this->hasMany(ProjectStatusHistory::class)->latest(); }
    public function reminders()         { return $this->hasMany(ProjectReminder::class); }

    public function isEditableByCreator(): bool
    {
        return in_array($this->status, ['draft', 'revision_requested']);
    }

    public function isManagedBy(User $user): bool
    {
        return $this->project_manager_id === $user->id || $this->user_id === $user->id;
    }
}
