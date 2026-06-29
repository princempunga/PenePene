<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectExpertReview extends Model
{
    protected $fillable = [
        'project_id', 'expert_user_id', 'decision', 'comments',
        'correction_notes', 'legal_deadline_met', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'legal_deadline_met' => 'boolean',
            'reviewed_at'        => 'datetime',
        ];
    }

    public function project() { return $this->belongsTo(Project::class); }
    public function expert()  { return $this->belongsTo(User::class, 'expert_user_id'); }
}
