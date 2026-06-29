<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectBudget;
use App\Models\ProjectConstraint;
use Illuminate\Support\Facades\DB;

class ProjectPersistenceService
{
    public function save(Project $project, array $data): Project
    {
        return DB::transaction(function () use ($project, $data) {
            $project->update([
                'title'                 => $data['title'],
                'division_id'           => $data['division_id'],
                'category'              => $data['category'] ?? $project->category,
                'planned_duration_days' => $data['planned_duration_days'] ?? null,
                'planned_start_date'    => $data['planned_start_date'] ?? null,
                'planned_end_date'      => $data['planned_end_date'] ?? null,
            ]);

            $this->syncInterests($project, $data['interests'] ?? []);
            $this->syncBudget($project, $data['budget'] ?? []);
            $this->syncTasks($project, $data['tasks'] ?? []);
            $this->syncMaterials($project, $data['materials'] ?? []);
            $this->syncPersonnel($project, $data['personnel'] ?? []);
            $this->syncConstraints($project, $data['constraints'] ?? []);

            return $project->fresh([
                'interests', 'budget.lines', 'tasks.members', 'materials',
                'personnel', 'constraints.solutions', 'division',
            ]);
        });
    }

    private function syncInterests(Project $project, array $interests): void
    {
        $project->interests()->delete();

        foreach ($interests as $i => $interest) {
            if (empty(trim($interest['description'] ?? ''))) {
                continue;
            }
            $project->interests()->create([
                'type'        => $interest['type'] ?? 'secondary',
                'description' => $interest['description'],
                'sort_order'  => $i,
            ]);
        }
    }

    private function syncBudget(Project $project, array $budgetData): void
    {
        if (empty($budgetData) && ! $project->budget) {
            return;
        }

        $budget = $project->budget ?? new ProjectBudget(['project_id' => $project->id]);
        $budget->fill([
            'contingency_rate'       => $budgetData['contingency_rate'] ?? 10,
            'currency'               => $budgetData['currency'] ?? 'CDF',
            'defined_by'             => $budgetData['defined_by'] ?? 'creator',
            'creator_unsure'         => (bool) ($budgetData['creator_unsure'] ?? false),
            'internal_expert_notes'  => $budgetData['internal_expert_notes'] ?? null,
            'external_expert_notes'  => $budgetData['external_expert_notes'] ?? null,
        ]);
        $budget->project_id = $project->id;
        $budget->save();

        $budget->lines()->delete();
        foreach ($budgetData['lines'] ?? [] as $i => $line) {
            if (empty(trim($line['label'] ?? ''))) {
                continue;
            }
            $budget->lines()->create([
                'label'      => $line['label'],
                'amount'     => $line['amount'] ?? 0,
                'category'   => $line['category'] ?? null,
                'notes'      => $line['notes'] ?? null,
                'sort_order' => $i,
            ]);
        }

        $budget->recalculate();
    }

    private function syncTasks(Project $project, array $tasks): void
    {
        $project->tasks()->delete();

        foreach ($tasks as $i => $task) {
            if (empty(trim($task['title'] ?? ''))) {
                continue;
            }
            $importance = $task['importance'] ?? 'medium';
            $durationDays = ! empty($task['duration_days'])
                ? (int) $task['duration_days']
                : $this->defaultDurationDays($importance);

            $plannedStart = $task['planned_start'] ?? null;
            $plannedEnd = $task['planned_end'] ?? null;

            if ($plannedStart && ! $plannedEnd && $durationDays) {
                $plannedEnd = \Carbon\Carbon::parse($plannedStart)->addDays($durationDays)->toDateString();
            }

            $created = $project->tasks()->create([
                'title'               => $task['title'],
                'description'         => $task['description'] ?? null,
                'importance'          => $importance,
                'duration_days'       => $durationDays,
                'planned_start'       => $plannedStart,
                'planned_end'         => $plannedEnd,
                'step_mode'           => $task['step_mode'] ?? 'successive',
                'responsible_name'    => $task['responsible_name'] ?? null,
                'responsible_user_id' => $task['responsible_user_id'] ?? null,
                'sort_order'          => $i,
            ]);

            foreach ($task['members'] ?? [] as $member) {
                if (empty(trim($member['member_name'] ?? ''))) {
                    continue;
                }
                $created->members()->create([
                    'member_name' => $member['member_name'],
                    'role'        => $member['role'] ?? null,
                ]);
            }
        }
    }

    private function syncMaterials(Project $project, array $materials): void
    {
        $project->materials()->delete();

        foreach ($materials as $material) {
            if (empty(trim($material['name'] ?? ''))) {
                continue;
            }
            $project->materials()->create([
                'name'     => $material['name'],
                'quantity' => $material['quantity'] ?? 1,
                'unit'     => $material['unit'] ?? null,
                'source'   => $material['source'] ?? 'existing',
                'notes'    => $material['notes'] ?? null,
            ]);
        }
    }

    private function syncPersonnel(Project $project, array $personnel): void
    {
        $project->personnel()->delete();

        foreach ($personnel as $person) {
            if (empty(trim($person['role_title'] ?? ''))) {
                continue;
            }
            $project->personnel()->create([
                'role_title' => $person['role_title'],
                'count'      => $person['count'] ?? 1,
                'source'     => $person['source'] ?? 'local',
                'notes'      => $person['notes'] ?? null,
            ]);
        }
    }

    private function syncConstraints(Project $project, array $constraints): void
    {
        $project->constraints()->each(fn ($c) => $c->solutions()->delete());
        $project->constraints()->delete();

        foreach ($constraints as $constraint) {
            if (empty(trim($constraint['description'] ?? ''))) {
                continue;
            }
            $created = $project->constraints()->create([
                'type'        => $constraint['type'] ?? 'manageable',
                'description' => $constraint['description'],
            ]);

            foreach ($constraint['solutions'] ?? [] as $solution) {
                if (empty(trim($solution['description'] ?? ''))) {
                    continue;
                }
                $created->solutions()->create([
                    'description' => $solution['description'],
                    'status'      => $solution['status'] ?? 'planned',
                ]);
            }
        }
    }

    /** Durée par défaut selon l'importance (g.iv). */
    private function defaultDurationDays(string $importance): int
    {
        return match ($importance) {
            'low'  => 7,
            'high' => 30,
            default => 14,
        };
    }
}
