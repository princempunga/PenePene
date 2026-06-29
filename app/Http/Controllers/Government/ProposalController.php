<?php

namespace App\Http\Controllers\Government;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\Proposal;
use App\Services\ProposalScopeService;
use App\Services\ProposalWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function __construct(
        private ProposalScopeService $scopeService,
        private ProposalWorkflowService $workflow,
    ) {}

    public function dashboard()
    {
        $user = Auth::user();
        $profile = $user->governmentProfile?->load('division');

        $stats = [
            'expert_queue'   => Project::where('status', 'submitted_experts')->count(),
            'in_execution'   => Project::where('status', 'in_execution')->count(),
            'tutelage_queue' => Project::whereIn('status', ['approved', 'tutelage_pending'])->count(),
            'overdue_tasks'  => ProjectTask::whereIn('status', ['overdue', 'delayed'])->count(),
            'my_level'       => $profile?->officer_level,
            'division'       => $profile?->division?->name,
        ];

        $recentProjects = Project::with(['user', 'division', 'budget'])
            ->whereNotIn('status', ['draft'])
            ->latest('updated_at')
            ->take(6)
            ->get();

        $legacyProposals = Proposal::query();
        $this->scopeService->scopeForOfficer($legacyProposals, $user);

        return Inertia::render('Government/Dashboard', [
            'stats'          => $stats,
            'recentProjects' => $recentProjects,
            'legacyCount'    => (clone $legacyProposals)->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = Proposal::with(['user', 'division', 'assignedTo']);

        $this->scopeService->scopeForOfficer($query, Auth::user());

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $proposals = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Government/Proposals/Index', [
            'proposals' => $proposals,
            'filters'   => $request->only('status', 'priority'),
            'profile'   => Auth::user()->governmentProfile?->load('division'),
        ]);
    }

    public function show(Proposal $proposal)
    {
        if (!$this->scopeService->canOfficerAccessProposal(Auth::user(), $proposal)) {
            abort(403);
        }

        $proposal->load([
            'user',
            'division.parent.parent.parent',
            'documents',
            'comments.user',
            'statusHistories.user',
            'assignedTo',
        ]);

        return Inertia::render('Government/Proposals/Show', [
            'proposal' => $proposal,
            'profile'  => Auth::user()->governmentProfile?->load('division'),
        ]);
    }

    public function takeCharge(Proposal $proposal)
    {
        if (!$this->scopeService->canOfficerAccessProposal(Auth::user(), $proposal)) {
            abort(403);
        }

        $this->workflow->startReview($proposal, Auth::user(), 'Prise en charge par ' . Auth::user()->name);

        return back()->with('success', 'Proposition prise en charge.');
    }

    public function updateStatus(Request $request, Proposal $proposal)
    {
        if (!$this->scopeService->canOfficerAccessProposal(Auth::user(), $proposal)) {
            abort(403);
        }

        $request->validate([
            'action' => 'required|in:approve,reject,escalate,revision',
            'note'   => 'nullable|string|max:2000',
        ]);

        match ($request->action) {
            'approve'  => $this->workflow->approve($proposal, Auth::user(), $request->note),
            'reject'   => $this->workflow->reject($proposal, Auth::user(), $request->note),
            'escalate' => $this->workflow->escalate($proposal, Auth::user(), $request->note),
            'revision' => $this->workflow->requestRevision($proposal, Auth::user(), $request->note),
        };

        return back()->with('success', 'Statut mis à jour.');
    }

    public function comment(Request $request, Proposal $proposal)
    {
        if (!$this->scopeService->canOfficerAccessProposal(Auth::user(), $proposal)) {
            abort(403);
        }

        $request->validate([
            'body'       => 'required|string|max:5000',
            'visibility' => 'required|in:public,internal',
        ]);

        $proposal->comments()->create([
            'user_id'     => Auth::id(),
            'body'        => $request->body,
            'is_official' => true,
            'visibility'  => $request->visibility,
        ]);

        if ($proposal->status === 'submitted') {
            $this->workflow->startReview($proposal, Auth::user());
        }

        return back()->with('success', 'Commentaire officiel ajouté.');
    }
}
