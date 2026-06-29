<?php

namespace App\Console\Commands;

use App\Models\ProjectReminder;
use App\Models\ProjectTask;
use App\Services\ProjectNotificationService;
use App\Services\ProjectWorkflowService;
use Illuminate\Console\Command;

class CheckProjectDeadlines extends Command
{
    protected $signature = 'projects:check-deadlines';

    protected $description = 'Rappels tâches, alertes retard, approbations tacites experts';

    public function handle(
        ProjectWorkflowService $workflow,
        ProjectNotificationService $notifications,
    ): int {
        $expired = $workflow->processExpiredExpertReviews();
        $this->info("Approbations tacites (délai experts) : {$expired}");

        $overdue = $workflow->syncOverdueTasks();
        $this->info("Tâches marquées en retard : {$overdue}");

        $reminders = ProjectReminder::with(['task', 'project', 'user'])
            ->whereNull('sent_at')
            ->where('due_at', '<=', now())
            ->get();

        foreach ($reminders as $reminder) {
            if ($reminder->type === 'deadline_reminder') {
                $notifications->notifyTaskReminder($reminder);
            } elseif ($reminder->type === 'overdue_alert' && $reminder->task) {
                $notifications->notifyTaskOverdue($reminder->project, $reminder->task);
            }

            $reminder->update(['sent_at' => now()]);

            if ($reminder->project_task_id) {
                ProjectTask::find($reminder->project_task_id)?->syncOverdueStatus();
            }
        }

        $this->info("Rappels traités : {$reminders->count()}");

        return self::SUCCESS;
    }
}
