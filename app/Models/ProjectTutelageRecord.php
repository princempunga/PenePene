<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTutelageRecord extends Model
{
    protected $fillable = [
        'project_id', 'tutelage_service', 'status', 'disbursement_status', 'notes', 'submitted_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
    }

    public function project() { return $this->belongsTo(Project::class); }
}
