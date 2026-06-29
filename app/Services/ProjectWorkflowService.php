<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectReminder;
use App\Models\ProjectTask;
use App\Models\ProjectTutelageRecord;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProjectWorkflowService
{
    public const EXPERT_REVIEW_DAYS = 30;

    public const DEFAULT_TUTELAGE_SERVICE = 'Ministère du Budget — Service de tutelle';

    public function __construct(
        private ?ProjectNotificationService $notifications = null,
    ) {
        $this->notifications ??= app(ProjectNotificationService::class);
    }

    public function submitToExperts(Project $project, User $user): void
    {
        $from = $project->status;

        $project->update([
            'status'                 => 'submitted_experts',
            'stage'                  => 'expert_review',
            'submitted_at'           => now(),
            'expert_review_deadline' => now()->addDays(self::EXPERT_REVIEW_DAYS),
        ]);

        $this->record($project, $user, $from, 'submitted_experts', 'design', 'expert_review',
            'Projet soumis au groupe d\'experts pour validation.');

        ProjectReminder::create([
            'project_id' => $project->id,
            'user_id'    => $user->id,
            'type'       => 'expert_deadline',
            'due_at'     => $project->expert_review_deadline,
        ]);
    }

    public function requestRevision(Project $project, User $expert, string $notes): void
    {
        $from = $project->status;

        $project->update([
            'status' => 'revision_requested',
            'stage'  => 'design',
        ]);

        $project->expertReviews()->create([
            'expert_user_id'   => $expert->id,
            'decision'         => 'revision_required',
            'correction_notes' => $notes,
            'reviewed_at'      => now(),
            'legal_deadline_met' => true,
        ]);

        $this->record($project, $expert, $from, 'revision_requested', 'expert_review', 'design', $notes);

        $this->notifications->notifyExpertRevision($project, $notes);
    }

    public function approveByExperts(Project $project, User $expert, ?string $notes = null, ?float $approvedBudget = null): void
    {
        $from = $project->status;

        $project->update([
            'status'              => 'approved',
            'stage'               => 'tutelage',
            'project_manager_id'  => $project->project_manager_id ?? $project->user_id,
            'expert_reviewed_at'  => now(),
            'approved_at'         => now(),
        ]);

        if ($approvedBudget && $project->budget) {
            $updates = [
                'approved_amount' => $approvedBudget,
                'status'          => 'approved',
            ];

            if ($project->budget->creator_unsure) {
                $updates['total_estimated'] = $approvedBudget;
                $updates['creator_unsure']    = false;
                $updates['defined_by']        = 'experts';
            }

            $project->budget->update($updates);
        }

        $project->expertReviews()->create([
            'expert_user_id' => $expert->id,
            'decision'       => 'approved',
            'comments'       => $notes,
            'reviewed_at'    => now(),
            'legal_deadline_met' => true,
        ]);

        ProjectTutelageRecord::updateOrCreate(
            ['project_id' => $project->id],
            [
                'tutelage_service' => self::DEFAULT_TUTELAGE_SERVICE,
                'status'           => 'submitted',
                'submitted_at'     => now(),
            ]
        );

        $project->update([
            'status'                => 'tutelage_pending',
            'tutelage_submitted_at' => now(),
        ]);

        $this->record($project, $expert, $from, 'tutelage_pending', 'expert_review', 'tutelage',
            ($notes ?? 'Projet approuvé par le groupe d\'experts.') . ' — Transmission automatique au service de tutelle.');

        $this->notifications->notifyExpertApproval($project->fresh());
    }

    /** Délai légal : sans réponse des experts, transmission automatique à la tutelle. */
    public function processExpiredExpertReviews(): int
    {
        $expired = Project::where('status', 'submitted_experts')
            ->whereNotNull('expert_review_deadline')
            ->where('expert_review_deadline', '<', now())
            ->get();

        foreach ($expired as $project) {
            $systemExpert = User::where('email', 'expert@rdc.gov.cd')->first();

            $project->update([
                'status'             => 'tutelage_pending',
                'stage'              => 'tutelage',
                'project_manager_id' => $project->project_manager_id ?? $project->user_id,
                'expert_reviewed_at' => now(),
                'approved_at'        => now(),
                'tutelage_submitted_at'=> now(),
            ]);

            if ($systemExpert) {
                $project->expertReviews()->create([
                    'expert_user_id'     => $systemExpert->id,
                    'decision'           => 'approved',
                    'comments'           => 'Approbation tacite — aucune réponse dans le délai légal de ' . self::EXPERT_REVIEW_DAYS . ' jours.',
                    'reviewed_at'        => now(),
                    'legal_deadline_met' => false,
                ]);
            }

            ProjectTutelageRecord::updateOrCreate(
                ['project_id' => $project->id],
                [
                    'tutelage_service' => self::DEFAULT_TUTELAGE_SERVICE,
                    'status'           => 'submitted',
                    'submitted_at'     => now(),
                ]
            );

            $this->record($project, $project->user, 'submitted_experts', 'tutelage_pending',
                'expert_review', 'tutelage',
                'Transmission automatique à la tutelle faute de réponse des experts dans le délai légal.');

            $this->notifications->notifyLegalSilenceApproval($project);
        }

        return $expired->count();
    }

    public function reject(Project $project, User $expert, string $notes): void
    {
        $from = $project->status;

        $project->update(['status' => 'rejected', 'stage' => 'archived']);

        $project->expertReviews()->create([
            'expert_user_id' => $expert->id,
            'decision'       => 'rejected',
            'comments'       => $notes,
            'reviewed_at'    => now(),
        ]);

        $this->record($project, $expert, $from, 'rejected', 'expert_review', 'archived', $notes);
    }

    public function submitToTutelage(Project $project, User $user, string $service): void
    {
        $from = $project->status;

        $project->update([
            'status'                => 'tutelage_pending',
            'stage'                 => 'tutelage',
            'tutelage_submitted_at' => now(),
        ]);

        $project->tutelageRecord()->updateOrCreate(
            ['project_id' => $project->id],
            ['tutelage_service' => $service, 'status' => 'submitted', 'submitted_at' => now()]
        );

        $this->record($project, $user, $from, 'tutelage_pending', 'tutelage', 'tutelage',
            "Projet transmis au service de tutelle : {$service}");
    }

    public function startExecution(Project $project, User $user): void
    {
        $from = $project->status;

        $project->update([
            'status'            => 'in_execution',
            'stage'             => 'execution',
            'actual_start_date' => now()->toDateString(),
        ]);

        $project->tutelageRecord?->update(['status' => 'approved']);

        $this->scheduleTaskReminders($project);

        $this->record($project, $user, $from, 'in_execution', 'tutelage', 'execution',
            'Mise en œuvre du projet démarrée.');
    }

    public function completeProject(Project $project, User $user): void
    {
        $from = $project->status;

        $project->update([
            'status'          => 'completed',
            'stage'           => 'evaluation',
            'actual_end_date' => now()->toDateString(),
            'completed_at'    => now(),
        ]);

        $this->record($project, $user, $from, 'completed', 'execution', 'evaluation',
            'Projet terminé — en attente du rapport final.');
    }

    public function evaluateAndArchive(Project $project, User $user): void
    {
        $project->finalReport?->update(['status' => 'evaluated']);

        $project->update([
            'status'    => 'archived',
            'stage'     => 'archived',
            'is_public' => true,
        ]);

        $this->record($project, $user, 'completed', 'archived', 'evaluation', 'archived',
            'Projet évalué et archivé — visible pour copie et adaptation (j).');
    }

    public function archiveProject(Project $project, User $user, bool $isPublic = true): void
    {
        $project->update([
            'status'    => 'archived',
            'stage'     => 'archived',
            'is_public' => $isPublic,
        ]);

        $this->record($project, $user, $project->getOriginal('status'), 'archived', 'evaluation', 'archived',
            'Projet archivé et rendu visible pour copie/adaptation.');
    }

    public function syncOverdueTasks(?Project $project = null): int
    {
        $query = ProjectTask::query()
            ->whereNotIn('status', ['completed'])
            ->whereNotNull('planned_end')
            ->whereDate('planned_end', '<', now());

        if ($project) {
            $query->where('project_id', $project->id);
        }

        return $query->update(['status' => 'overdue']);
    }

    public function scheduleTaskReminders(Project $project): void
    {
        $project->load('tasks');

        foreach ($project->tasks as $task) {
            if (! $task->planned_end) {
                continue;
            }

            $recipientId = $task->responsible_user_id
                ?? $project->project_manager_id
                ?? $project->user_id;

            if (! $recipientId) {
                continue;
            }

            ProjectReminder::firstOrCreate(
                [
                    'project_task_id' => $task->id,
                    'type'            => 'deadline_reminder',
                ],
                [
                    'project_id' => $project->id,
                    'user_id'    => $recipientId,
                    'due_at'     => $task->planned_end->copy()->subDay(),
                ]
            );

            ProjectReminder::firstOrCreate(
                [
                    'project_task_id' => $task->id,
                    'type'            => 'overdue_alert',
                ],
                [
                    'project_id' => $project->id,
                    'user_id'    => $recipientId,
                    'due_at'     => $task->planned_end->copy()->addDay(),
                ]
            );
        }
    }

    public function copyProject(Project $source, User $user): Project
    {
        return DB::transaction(function () use ($source, $user) {
            $source->load([
                'interests', 'budget.lines', 'tasks.members', 'materials',
                'personnel', 'constraints.solutions',
            ]);

            $copy = $source->replicate(['project_number', 'status', 'stage', 'submitted_at',
                'expert_review_deadline', 'expert_reviewed_at', 'approved_at',
                'tutelage_submitted_at', 'completed_at', 'is_public']);
            $copy->fill([
                'user_id'               => $user->id,
                'status'                => 'draft',
                'stage'                 => 'design',
                'copied_from_project_id'=> $source->id,
                'project_manager_id'    => null,
            ]);
            $copy->save();

            foreach ($source->interests as $interest) {
                $copy->interests()->create($interest->only(['type', 'description', 'sort_order']));
            }

            if ($source->budget) {
                $budget = $copy->budget()->create($source->budget->only([
                    'total_estimated', 'contingency_rate', 'contingency_amount',
                    'currency', 'defined_by', 'creator_unsure', 'status',
                ]));
                foreach ($source->budget->lines as $line) {
                    $budget->lines()->create($line->only(['label', 'amount', 'category', 'notes', 'sort_order']));
                }
            }

            foreach ($source->tasks as $task) {
                $newTask = $copy->tasks()->create($task->only([
                    'title', 'description', 'importance', 'duration_days',
                    'planned_start', 'planned_end', 'step_mode', 'responsible_name', 'sort_order',
                ]));
                foreach ($task->members as $member) {
                    $newTask->members()->create($member->only(['member_name', 'role']));
                }
            }

            foreach ($source->materials as $material) {
                $copy->materials()->create($material->only(['name', 'quantity', 'unit', 'source', 'notes']));
            }

            foreach ($source->personnel as $person) {
                $copy->personnel()->create($person->only(['role_title', 'count', 'source', 'notes']));
            }

            foreach ($source->constraints as $constraint) {
                $newConstraint = $copy->constraints()->create($constraint->only(['type', 'description']));
                foreach ($constraint->solutions as $solution) {
                    $newConstraint->solutions()->create($solution->only(['description', 'status']));
                }
            }

            return $copy;
        });
    }

    private function record(
        Project $project, User $user, ?string $fromStatus, string $toStatus,
        ?string $fromStage, ?string $toStage, ?string $note,
    ): void {
        $project->statusHistories()->create([
            'user_id'     => $user->id,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
            'from_stage'  => $fromStage,
            'to_stage'    => $toStage,
            'note'        => $note,
        ]);
    }
}
