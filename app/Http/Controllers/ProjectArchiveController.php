<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectArchiveController extends Controller
{
    public function __construct(private ProjectWorkflowService $workflow) {}

    public function index(Request $request)
    {
        $query = Project::with(['division', 'user', 'budget'])
            ->where('is_public', true)
            ->whereIn('status', ['completed', 'evaluated', 'archived']);

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $projects = $query->latest('completed_at')->paginate(12)->withQueryString();

        return Inertia::render('Projects/Archive', [
            'projects' => $projects,
            'filters'  => $request->only('search'),
        ]);
    }

    public function show(Project $project)
    {
        abort_unless($project->is_public, 404);

        $project->load([
            'division', 'interests', 'budget.lines', 'tasks',
            'materials', 'personnel', 'constraints.solutions',
            'finalReport', 'copiedFrom',
        ]);

        return Inertia::render('Projects/ArchiveShow', ['project' => $project]);
    }

    public function copy(Project $project)
    {
        abort_unless($project->is_public, 404);

        $copy = $this->workflow->copyProject($project, Auth::user());

        return redirect()->route('projects.edit', $copy)
            ->with('success', 'Projet copié — adaptez-le selon vos besoins.');
    }
}
