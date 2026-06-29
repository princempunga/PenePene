<?php

namespace App\Http\Controllers;

use App\Models\AdministrativeDivision;
use App\Models\Project;
use App\Services\ProjectPersistenceService;
use App\Services\ProjectValidationService;
use App\Services\ProjectWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectPersistenceService $persistence,
        private ProjectWorkflowService $workflow,
        private ProjectValidationService $validation,
    ) {}

    public function index(Request $request)
    {
        $query = Project::with(['division', 'tasks'])
            ->where('user_id', Auth::id());

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $projects = $query->latest()->paginate(10)->withQueryString();
        $this->workflow->syncOverdueTasks();

        $all = Project::with('tasks')->where('user_id', Auth::id())->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only('status'),
            'stats'    => [
                'draft'   => $all->where('status', 'draft')->count(),
                'active'  => $all->whereIn('status', ['submitted_experts', 'approved', 'in_execution', 'tutelage_pending'])->count(),
                'overdue' => $all->sum(fn ($p) => $p->tasks->whereIn('status', ['overdue', 'delayed'])->count()),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Form', [
            'project'   => null,
            'provinces' => $this->provinces(),
            'options'   => $this->formOptions(),
            'checklist' => [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProject($request);

        $project = Project::create([
            'user_id'     => Auth::id(),
            'division_id' => $validated['division_id'],
            'title'       => $validated['title'],
            'category'    => $validated['category'] ?? 'other',
            'status'      => 'draft',
            'stage'       => 'design',
        ]);

        $this->persistence->save($project, $validated);

        if ($request->boolean('submit_experts')) {
            $this->submitToExpertsIfReady($project->fresh());
        }

        return redirect()->route('projects.show', $project)
            ->with('success', $request->boolean('submit_experts')
                ? 'Projet soumis au groupe d\'experts.'
                : 'Brouillon enregistré.');
    }

    public function show(Project $project)
    {
        $this->authorizeProject($project);
        $this->workflow->syncOverdueTasks($project);

        $project->load([
            'division.parent.parent.parent',
            'interests', 'budget.lines', 'tasks.members', 'tasks.reports',
            'materials', 'personnel', 'constraints.solutions',
            'expertReviews.expert', 'tutelageRecord', 'documents.uploader',
            'finalReport', 'statusHistories.user', 'projectManager', 'copiedFrom',
        ]);

        return Inertia::render('Projects/Show', [
            'project'   => $project,
            'options'   => $this->formOptions(),
            'checklist' => $this->validation->completionChecklist($project),
        ]);
    }

    public function edit(Project $project)
    {
        $this->authorizeProject($project);

        if (! $project->isEditableByCreator()) {
            return redirect()->route('projects.show', $project)
                ->withErrors(['error' => 'Ce projet ne peut plus être modifié.']);
        }

        $project->load([
            'interests', 'budget.lines', 'tasks.members', 'materials',
            'personnel', 'constraints.solutions', 'division',
        ]);

        return Inertia::render('Projects/Form', [
            'project'   => $project,
            'provinces' => $this->provinces(),
            'options'   => $this->formOptions(),
            'checklist' => $this->validation->completionChecklist($project),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProject($project);

        if (! $project->isEditableByCreator()) {
            return back()->withErrors(['error' => 'Ce projet ne peut plus être modifié.']);
        }

        $validated = $this->validateProject($request);
        $this->persistence->save($project, $validated);

        if ($request->boolean('submit_experts')) {
            $this->submitToExpertsIfReady($project->fresh());
        }

        return redirect()->route('projects.show', $project)
            ->with('success', 'Projet mis à jour.');
    }

    public function submitExperts(Project $project)
    {
        $this->authorizeProject($project);

        if (! $project->isEditableByCreator()) {
            return back()->withErrors(['error' => 'Soumission impossible dans l\'état actuel.']);
        }

        $this->submitToExpertsIfReady($project);

        return back()->with('success', 'Projet soumis au groupe d\'experts.');
    }

    public function executionDashboard(Project $project)
    {
        if (! $project->isManagedBy(Auth::user()) && $project->user_id !== Auth::id()) {
            abort(403);
        }

        $this->workflow->syncOverdueTasks($project);

        $project->load([
            'tasks.members', 'tasks.reports', 'tasks.delayReports',
            'documents', 'finalReport', 'budget', 'projectManager',
        ]);

        return Inertia::render('Projects/Execution', [
            'project' => $project,
        ]);
    }

    public function submitFinalReport(Request $request, Project $project)
    {
        if (! $project->isManagedBy(Auth::user())) {
            abort(403);
        }

        $request->validate([
            'body'             => 'required|string|max:20000',
            'lessons_learned'  => 'required|string|max:10000',
            'recommendations'  => 'nullable|string|max:10000',
        ]);

        $project->finalReport()->updateOrCreate(
            ['project_id' => $project->id],
            [
                'submitted_by'    => Auth::id(),
                'body'            => $request->body,
                'lessons_learned' => $request->lessons_learned,
                'recommendations' => $request->recommendations,
                'status'          => 'submitted',
                'submitted_at'    => now(),
            ]
        );

        $project->update(['lessons_learned' => $request->lessons_learned]);
        $this->workflow->completeProject($project, Auth::user());
        $this->workflow->evaluateAndArchive($project->fresh(), Auth::user());

        return back()->with('success', 'Rapport final soumis — projet évalué et archivé pour consultation publique.');
    }

    private function submitToExpertsIfReady(Project $project): void
    {
        $this->validation->assertReadyForExpertSubmission($project);
        $this->workflow->submitToExperts($project, Auth::user());
    }

    private function authorizeProject(Project $project): void
    {
        if ($project->user_id !== Auth::id() && ! $project->isManagedBy(Auth::user())) {
            abort(403);
        }
    }

    private function validateProject(Request $request): array
    {
        return $request->validate([
            'title'                 => 'required|string|max:255',
            'division_id'           => 'required|exists:administrative_divisions,id',
            'category'              => 'nullable|in:infrastructure,education,health,agriculture,security,environment,economy,social,other',
            'planned_duration_days' => 'nullable|integer|min:1',
            'planned_start_date'    => 'nullable|date',
            'planned_end_date'      => 'nullable|date|after_or_equal:planned_start_date',
            'interests'             => 'nullable|array',
            'interests.*.type'      => 'in:primary,secondary',
            'interests.*.description'=> 'nullable|string|max:2000',
            'budget'                => 'nullable|array',
            'budget.contingency_rate'=> 'nullable|numeric|min:0|max:100',
            'budget.creator_unsure' => 'boolean',
            'budget.lines'          => 'nullable|array',
            'tasks'                 => 'nullable|array',
            'materials'             => 'nullable|array',
            'personnel'             => 'nullable|array',
            'constraints'           => 'nullable|array',
            'submit_experts'        => 'boolean',
        ]);
    }

    private function provinces()
    {
        return AdministrativeDivision::where('level', 'province')
            ->where('is_active', true)->orderBy('sort_order')->orderBy('name')
            ->get(['id', 'name', 'level']);
    }

    private function formOptions(): array
    {
        return [
            'categories'   => ['infrastructure', 'education', 'health', 'agriculture', 'security', 'environment', 'economy', 'social', 'other'],
            'stepModes'    => ['successive', 'simultaneous', 'concurrent', 'synchronous', 'cumulative'],
            'importance'   => ['low', 'medium', 'high'],
            'materialSrc'  => ['existing', 'import'],
            'personnelSrc' => ['local', 'expatriate'],
            'constraintTypes' => ['inevitable', 'manageable'],
        ];
    }
}
