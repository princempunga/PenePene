<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectBudget extends Model
{
    protected $fillable = [
        'project_id', 'total_estimated', 'contingency_rate', 'contingency_amount',
        'approved_amount', 'currency', 'defined_by', 'internal_expert_notes',
        'external_expert_notes', 'creator_unsure', 'status',
    ];

    protected function casts(): array
    {
        return [
            'total_estimated'   => 'decimal:2',
            'contingency_rate'  => 'decimal:2',
            'contingency_amount'=> 'decimal:2',
            'approved_amount'   => 'decimal:2',
            'creator_unsure'    => 'boolean',
        ];
    }

    public function project() { return $this->belongsTo(Project::class); }
    public function lines()   { return $this->hasMany(ProjectBudgetLine::class)->orderBy('sort_order'); }

    public function recalculate(): void
    {
        $subtotal = $this->lines()->sum('amount');
        $contingency = $subtotal * ($this->contingency_rate / 100);
        $this->update([
            'total_estimated'    => $subtotal + $contingency,
            'contingency_amount' => $contingency,
        ]);
    }
}
