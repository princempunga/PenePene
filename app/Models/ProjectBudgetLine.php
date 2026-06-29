<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectBudgetLine extends Model
{
    protected $fillable = ['project_budget_id', 'label', 'amount', 'category', 'notes', 'sort_order'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function budget() { return $this->belongsTo(ProjectBudget::class, 'project_budget_id'); }
}
