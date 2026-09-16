<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectDocumentController extends Controller
{
    /**
     * Statuses under which a government-role user may already view this
     * project — the union of what Government\ExpertProjectController::show()
     * and Government\TutelageProjectController::show() each gate on. Kept
     * in sync with those two rather than inventing a broader or narrower
     * rule for documents specifically.
     */
    private const GOVERNMENT_VISIBLE_STATUSES = [
        'submitted_experts', 'revision_requested', 'approved',
        'tutelage_pending', 'in_execution',
    ];

    /**
     * Stream a project document. The file lives on a disk that is never
     * directly web-accessible — this is the sole path to reading it.
     */
    public function download(Request $request, Project $project, ProjectDocument $document)
    {
        // IDOR guard: a valid document id belonging to a DIFFERENT project
        // than the one in the URL must be refused, even if the requester
        // can otherwise see that other project.
        abort_unless($document->project_id === $project->id, 404);

        $this->authorizeAccess($request->user(), $project, $document);

        $disk = $document->disk ?? 'public';

        if (! Storage::disk($disk)->exists($document->path)) {
            abort(404, 'Document introuvable.');
        }

        return Storage::disk($disk)->response($document->path, $document->name);
    }

    private function authorizeAccess($user, Project $project, ProjectDocument $document): void
    {
        if ($user->isAdmin()) {
            return;
        }

        // Creator or assigned manager — same check as
        // ProjectController::authorizeProject() / Project::isManagedBy().
        if ($project->user_id === $user->id || $project->isManagedBy($user)) {
            return;
        }

        // Responsible for the specific task this document is attached to —
        // same check as ProjectTaskController::authorizeTask().
        if ($document->project_task_id && $document->task?->responsible_user_id === $user->id) {
            return;
        }

        // Government staff reviewing this project at its current stage.
        if ($user->role === 'government' && in_array($project->status, self::GOVERNMENT_VISIBLE_STATUSES, true)) {
            return;
        }

        abort(403);
    }
}
