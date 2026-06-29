<?php

namespace App\Http\Controllers;

use App\Models\AdministrativeDivision;
use App\Models\Proposal;
use App\Models\ProposalDocument;
use App\Services\ProposalWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function __construct(
        private ProposalWorkflowService $workflow,
    ) {}

    public function index(Request $request)
    {
        $query = Proposal::with(['division'])
            ->where('user_id', Auth::id());

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $proposals = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Proposals/Index', [
            'proposals' => $proposals,
            'filters'   => $request->only('status'),
        ]);
    }

    public function create()
    {
        $provinces = AdministrativeDivision::where('level', 'province')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'level']);

        return Inertia::render('Proposals/Create', [
            'provinces' => $provinces,
            'categories' => $this->categories(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'summary'     => 'required|string|max:500',
            'body'        => 'required|string|max:10000',
            'category'    => 'required|in:infrastructure,education,health,agriculture,security,environment,economy,social,other',
            'priority'    => 'required|in:low,medium,high,urgent',
            'division_id' => 'required|exists:administrative_divisions,id',
            'documents'   => 'nullable|array|max:5',
            'documents.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
            'submit_now'  => 'boolean',
        ], [
            'title.required'       => 'Le titre est obligatoire.',
            'summary.required'     => 'Le résumé est obligatoire.',
            'body.required'        => 'La description détaillée est obligatoire.',
            'division_id.required' => 'La localisation administrative est obligatoire.',
        ]);

        $status = $request->boolean('submit_now') ? 'submitted' : 'draft';

        $proposal = Proposal::create([
            'user_id'     => Auth::id(),
            'division_id' => $request->division_id,
            'title'       => $request->title,
            'summary'     => $request->summary,
            'body'        => $request->body,
            'category'    => $request->category,
            'priority'    => $request->priority,
            'status'      => 'draft',
        ]);

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('proposals/' . $proposal->id, 'public');
                ProposalDocument::create([
                    'proposal_id' => $proposal->id,
                    'name'        => $file->getClientOriginalName(),
                    'path'        => $path,
                    'mime_type'   => $file->getMimeType(),
                    'size'        => $file->getSize(),
                ]);
            }
        }

        if ($request->boolean('submit_now')) {
            $this->workflow->submit($proposal, Auth::user());
        }

        return redirect()->route('proposals.show', $proposal)
            ->with('success', $request->boolean('submit_now')
                ? 'Votre proposition a été soumise aux autorités compétentes.'
                : 'Brouillon enregistré avec succès.');
    }

    public function show(Proposal $proposal)
    {
        if ($proposal->user_id !== Auth::id()) {
            abort(403);
        }

        $proposal->load([
            'division.parent.parent.parent',
            'documents',
            'comments' => fn ($q) => $q->where('visibility', 'public')->with('user'),
            'statusHistories.user',
        ]);

        return Inertia::render('Proposals/Show', [
            'proposal' => $proposal,
        ]);
    }

    public function submit(Proposal $proposal)
    {
        if ($proposal->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$proposal->isEditableBySubmitter()) {
            return back()->withErrors(['error' => 'Cette proposition ne peut plus être soumise.']);
        }

        $this->workflow->submit($proposal, Auth::user());

        return back()->with('success', 'Proposition soumise avec succès.');
    }

    public function reply(Request $request, Proposal $proposal)
    {
        if ($proposal->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate(['body' => 'required|string|max:5000']);

        $proposal->comments()->create([
            'user_id'     => Auth::id(),
            'body'        => $request->body,
            'is_official' => false,
            'visibility'  => 'public',
        ]);

        return back()->with('success', 'Commentaire ajouté.');
    }

    private function categories(): array
    {
        return [
            ['value' => 'infrastructure', 'label' => 'Infrastructure'],
            ['value' => 'education', 'label' => 'Éducation'],
            ['value' => 'health', 'label' => 'Santé'],
            ['value' => 'agriculture', 'label' => 'Agriculture'],
            ['value' => 'security', 'label' => 'Sécurité'],
            ['value' => 'environment', 'label' => 'Environnement'],
            ['value' => 'economy', 'label' => 'Économie'],
            ['value' => 'social', 'label' => 'Social'],
            ['value' => 'other', 'label' => 'Autre'],
        ];
    }
}
