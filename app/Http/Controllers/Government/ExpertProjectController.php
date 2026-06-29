<?php

namespace App\Http\Controllers\Government;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ProjectWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpertProjectController extends Controller
{
    public function __construct(private ProjectWorkflowService $workflow) {}

    public function index(Request $request)
    {
        $query = Project::with(['user', 'division', 'budget'])
            ->whereIn('status', ['submitted_experts', 'revision_requested']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $projects = $query->latest('submitted_at')->paginate(20)->withQueryString();

        return Inertia::render('Government/Expert/Index', [
            'projects' => $projects,
            'filters'  => $request->only('status'),
        ]);
    }

    public function show(Project $project)
    {
        abort_unless(in_array($project->status, ['submitted_experts', 'revision_requested', 'approved']), 404);

        $project->load([
            'user', 'division', 'interests', 'budget.lines', 'tasks.members',
            'materials', 'personnel', 'constraints.solutions', 'documents',
            'expertReviews.expert', 'statusHistories.user',
        ]);

        return Inertia::render('Government/Expert/Show', ['project' => $project]);
    }

    public function review(Request $request, Project $project)
    {
        abort_unless($project->status === 'submitted_experts', 422);

        $rules = [
            'action'          => 'required|in:approve,revision,reject',
            'notes'           => 'nullable|string|max:5000',
            'approved_budget' => 'nullable|numeric|min:0',
        ];

        if ($request->action === 'approve' && $project->budget?->creator_unsure) {
            $rules['approved_budget'] = 'required|numeric|min:0';
        }

        $request->validate($rules);

        match ($request->action) {
            'approve'  => $this->workflow->approveByExperts($project, Auth::user(), $request->notes, $request->approved_budget),
            'revision' => $this->workflow->requestRevision($project, Auth::user(), $request->notes ?? ''),
            'reject'   => $this->workflow->reject($project, Auth::user(), $request->notes ?? ''),
        };

        return redirect()->route('government.expert.index')
            ->with('success', 'Décision enregistrée.');
    }
}
