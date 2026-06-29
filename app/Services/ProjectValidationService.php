<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Validation\ValidationException;

class ProjectValidationService
{
    /** Vérifie que le projet contient toutes les sections a) à i) avant soumission aux experts. */
    public function assertReadyForExpertSubmission(Project $project): void
    {
        $project->load(['interests', 'budget.lines', 'tasks.members', 'materials', 'personnel', 'constraints.solutions']);

        $errors = [];

        if (empty(trim($project->title ?? ''))) {
            $errors['title'] = 'L\'intitulé du projet (a) est obligatoire.';
        }

        $primary = $project->interests->firstWhere('type', 'primary')
            ?? $project->interests->first();
        if (! $primary || empty(trim($primary->description ?? ''))) {
            $errors['interests'] = 'L\'intérêt principal (b.i) est obligatoire.';
        }

        if (! $project->budget) {
            $errors['budget'] = 'Le budget estimatif (c) doit être renseigné ou marqué « experts s\'en occupent ».';
        } elseif (! $project->budget->creator_unsure) {
            $hasLines = $project->budget->lines->filter(fn ($l) => ! empty(trim($l->label ?? '')))->isNotEmpty();
            if (! $hasLines && ! $project->budget->total_estimated) {
                $errors['budget'] = 'Ajoutez au moins une ligne budgétaire ou cochez « experts s\'en occupent ».';
            }
        }

        $validTasks = $project->tasks->filter(fn ($t) => ! empty(trim($t->title ?? '')));
        if ($validTasks->isEmpty()) {
            $errors['tasks'] = 'Au moins une tâche (d) avec calendrier et responsable est requise.';
        } else {
            foreach ($validTasks as $i => $task) {
                if (empty(trim($task->responsible_name ?? '')) && ! $task->responsible_user_id) {
                    $errors["tasks.{$i}.responsible"] = "La tâche « {$task->title} » doit avoir un responsable (d.iii).";
                }
                if (! $task->planned_start || ! $task->planned_end) {
                    $errors["tasks.{$i}.calendar"] = "La tâche « {$task->title} » doit avoir un calendrier fixe (d.i).";
                }
            }
        }

        if ($project->materials->filter(fn ($m) => ! empty(trim($m->name ?? '')))->isEmpty()) {
            $errors['materials'] = 'Au moins un matériel (e) doit être renseigné.';
        }

        if ($project->personnel->filter(fn ($p) => ! empty(trim($p->role_title ?? '')))->isEmpty()) {
            $errors['personnel'] = 'Au moins un personnel participant (f) doit être renseigné.';
        }

        if (! $project->planned_duration_days && ! $project->planned_end_date) {
            $errors['duration'] = 'La durée du projet (g) doit être précisée.';
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    /** Score de complétude pour l'interface (sections a–i). */
    public function completionChecklist(Project $project): array
    {
        $project->loadMissing(['interests', 'budget.lines', 'tasks', 'materials', 'personnel', 'constraints']);

        $primary = $project->interests->firstWhere('type', 'primary');

        return [
            ['key' => 'a', 'label' => 'Intitulé du projet', 'done' => ! empty(trim($project->title ?? ''))],
            ['key' => 'b', 'label' => 'Intérêt principal', 'done' => $primary && ! empty(trim($primary->description ?? ''))],
            ['key' => 'b2', 'label' => 'Intérêts secondaires', 'done' => $project->interests->where('type', 'secondary')->filter(fn ($i) => trim($i->description ?? '') !== '')->isNotEmpty()],
            ['key' => 'c', 'label' => 'Budget estimatif', 'done' => $project->budget && ($project->budget->creator_unsure || $project->budget->lines->isNotEmpty())],
            ['key' => 'd', 'label' => 'Tâches & calendrier', 'done' => $project->tasks->filter(fn ($t) => trim($t->title ?? '') !== '')->isNotEmpty()],
            ['key' => 'e', 'label' => 'Matériels', 'done' => $project->materials->isNotEmpty()],
            ['key' => 'f', 'label' => 'Personnels', 'done' => $project->personnel->isNotEmpty()],
            ['key' => 'g', 'label' => 'Durée du projet', 'done' => (bool) ($project->planned_duration_days || $project->planned_end_date)],
            ['key' => 'h', 'label' => 'Contraintes', 'done' => $project->constraints->isNotEmpty()],
            ['key' => 'i', 'label' => 'Solutions prévues', 'done' => $project->constraints->contains(fn ($c) => $c->solutions->isNotEmpty())],
        ];
    }
}
