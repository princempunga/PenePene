<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectDelayReport;
use App\Models\ProjectDocument;
use App\Models\ProjectTask;
use App\Models\ProjectTaskReport;
use App\Services\ProjectWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectTaskController extends Controller
{
    public function __construct(private ProjectWorkflowService $workflow) {}

    public function submitReport(Request $request, Project $project, ProjectTask $task)
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorizeTask($project, $task);

        $request->validate([
            'body'                 => 'required|string|max:10000',
            'delay_justification'  => 'nullable|string|max:5000',
            'document'             => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
        ]);

        $isOnTime = ! $task->isOverdue();

        ProjectTaskReport::create([
            'project_task_id'     => $task->id,
            'user_id'             => Auth::id(),
            'body'                => $request->body,
            'is_on_time'          => $isOnTime,
            'delay_justification' => $isOnTime ? null : $request->delay_justification,
        ]);

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $path = $file->store("projects/{$project->id}/tasks/{$task->id}", 'public');
            ProjectDocument::create([
                'project_id'      => $project->id,
                'project_task_id' => $task->id,
                'uploaded_by'     => Auth::id(),
                'type'            => 'task_report',
                'stage'           => 'execution',
                'name'            => $file->getClientOriginalName(),
                'path'            => $path,
                'mime_type'       => $file->getMimeType(),
                'size'            => $file->getSize(),
            ]);
        }

        $task->update(['status' => 'completed', 'actual_end' => now()->toDateString()]);

        return back()->with('success', 'Rapport partiel soumis.');
    }

    public function reportDelay(Request $request, Project $project, ProjectTask $task)
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorizeTask($project, $task);

        $request->validate([
            'reason'           => 'required|string|max:5000',
            'new_planned_end'  => 'nullable|date|after:today',
        ]);

        $beforeDeadline = $task->planned_end && now()->lt($task->planned_end);

        ProjectDelayReport::create([
            'project_task_id'          => $task->id,
            'user_id'                  => Auth::id(),
            'reason'                   => $request->reason,
            'reported_before_deadline' => $beforeDeadline,
            'new_planned_end'          => $request->new_planned_end,
        ]);

        $task->update([
            'status'      => 'delayed',
            'planned_end' => $request->new_planned_end ?? $task->planned_end,
        ]);

        return back()->with('success', 'Retard signalé et justifié.');
    }

    private function authorizeTask(Project $project, ProjectTask $task): void
    {
        $user = Auth::user();
        $isResponsible = $task->responsible_user_id === $user->id;
        $isManager = $project->isManagedBy($user);

        if (! $isResponsible && ! $isManager) {
            abort(403);
        }
    }
}
