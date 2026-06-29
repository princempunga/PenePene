<?php

namespace App\Http\Controllers\Government;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Services\ProjectWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TutelageProjectController extends Controller
{
    public function __construct(private ProjectWorkflowService $workflow) {}

    public function index()
    {
        $projects = Project::with(['user', 'division', 'budget', 'tutelageRecord'])
            ->whereIn('status', ['approved', 'tutelage_pending', 'in_execution'])
            ->where('stage', '!=', 'design')
            ->latest('approved_at')
            ->paginate(20);

        return Inertia::render('Government/Tutelage/Index', ['projects' => $projects]);
    }

    public function show(Project $project)
    {
        abort_unless(in_array($project->status, ['approved', 'tutelage_pending', 'in_execution']), 404);

        $project->load([
            'user', 'division', 'budget.lines', 'tutelageRecord',
            'documents.uploader', 'expertReviews',
        ]);

        return Inertia::render('Government/Tutelage/Show', ['project' => $project]);
    }

    public function submitTutelage(Request $request, Project $project)
    {
        $request->validate(['tutelage_service' => 'required|string|max:255']);
        $this->workflow->submitToTutelage($project, Auth::user(), $request->tutelage_service);

        return back()->with('success', 'Projet transmis au service de tutelle.');
    }

    public function uploadDocument(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,xlsx',
            'type' => 'required|in:budget_proforma,invoice,justification,general',
        ]);

        $file = $request->file('file');
        $path = $file->store("projects/{$project->id}/tutelage", 'public');

        ProjectDocument::create([
            'project_id'  => $project->id,
            'uploaded_by' => Auth::id(),
            'type'        => $request->type,
            'stage'       => 'tutelage',
            'name'        => $file->getClientOriginalName(),
            'path'        => $path,
            'mime_type'   => $file->getMimeType(),
            'size'        => $file->getSize(),
        ]);

        return back()->with('success', 'Document ajouté.');
    }

    public function startExecution(Project $project)
    {
        $this->workflow->startExecution($project, Auth::user());

        return back()->with('success', 'Mise en œuvre autorisée.');
    }

    public function updateDisbursement(Request $request, Project $project)
    {
        $request->validate(['disbursement_status' => 'required|in:pending,partial,completed']);

        $project->tutelageRecord?->update([
            'disbursement_status' => $request->disbursement_status,
            'status'              => $request->disbursement_status === 'completed' ? 'completed' : 'disbursement_in_progress',
        ]);

        return back()->with('success', 'Statut de décaissement mis à jour.');
    }
}
