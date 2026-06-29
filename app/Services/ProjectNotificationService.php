<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectReminder;
use App\Models\User;

class ProjectNotificationService
{
    public function notify(User $user, string $type, string $title, string $body, ?string $actionUrl = null): void
    {
        Notification::create([
            'user_id'    => $user->id,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'action_url' => $actionUrl,
            'is_read'    => false,
        ]);
    }

    public function notifyTaskReminder(ProjectReminder $reminder): void
    {
        $task = $reminder->task;
        $project = $reminder->project;

        if (! $task || ! $project) {
            return;
        }

        $this->notify(
            $reminder->user,
            'project_task_reminder',
            'Échéance de tâche proche',
            "La tâche « {$task->title} » du projet « {$project->title} » arrive à échéance le {$task->planned_end?->format('d/m/Y')}.",
            "/projects/{$project->id}/execution"
        );
    }

    public function notifyTaskOverdue(Project $project, $task): void
    {
        $user = $task->responsible ?? $project->projectManager ?? $project->user;
        if (! $user) {
            return;
        }

        $this->notify(
            $user,
            'project_task_overdue',
            'Tâche en retard',
            "La tache « {$task->title} » n'a pas respecté son calendrier. Justification obligatoire.",
            "/projects/{$project->id}/execution"
        );
    }

    public function notifyExpertRevision(Project $project, string $notes): void
    {
        $this->notify(
            $project->user,
            'project_revision',
            'Corrections demandées par les experts',
            $notes ?: 'Votre projet a été renvoyé pour correction.',
            "/projects/{$project->id}/edit"
        );
    }

    public function notifyExpertApproval(Project $project): void
    {
        $this->notify(
            $project->user,
            'project_approved',
            'Projet approuvé — vous êtes Project Manager',
            'Votre projet a été approuvé et transmis au service de tutelle. Vous pouvez lancer la mise en œuvre après validation budgétaire.',
            "/projects/{$project->id}"
        );
    }

    public function notifyLegalSilenceApproval(Project $project): void
    {
        $this->notify(
            $project->user,
            'project_legal_silence',
            'Approbation tacite (délai légal)',
            'Aucune réponse des experts dans le délai prévu. Le projet est transmis au service de tutelle conformément à la loi.',
            "/projects/{$project->id}"
        );
    }
}
