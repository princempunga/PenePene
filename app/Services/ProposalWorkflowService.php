<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\User;

class ProposalWorkflowService
{
    public function __construct(
        private ProposalScopeService $scopeService,
    ) {}

    public function submit(Proposal $proposal, User $user): void
    {
        $proposal->loadMissing('division');

        $fromStatus = $proposal->status;
        $initialLevel = $this->scopeService->initialReviewLevel($proposal->division);

        $proposal->update([
            'status'        => 'submitted',
            'current_level' => $initialLevel,
            'submitted_at'  => now(),
        ]);

        $this->recordHistory($proposal, $user, $fromStatus, 'submitted', null, $initialLevel, 'Soumission initiale');
    }

    public function startReview(Proposal $proposal, User $user, ?string $note = null): void
    {
        $fromStatus = $proposal->status;

        $proposal->update([
            'status'      => 'under_review',
            'assigned_to' => $user->id,
        ]);

        $this->recordHistory($proposal, $user, $fromStatus, 'under_review', $proposal->current_level, $proposal->current_level, $note);
    }

    public function escalate(Proposal $proposal, User $user, ?string $note = null): void
    {
        $nextLevel = $this->scopeService->nextLevel($proposal->current_level);

        if (!$nextLevel) {
            return;
        }

        $fromLevel = $proposal->current_level;

        $proposal->update([
            'status'      => 'submitted',
            'current_level' => $nextLevel,
            'assigned_to' => null,
        ]);

        $this->recordHistory($proposal, $user, 'under_review', 'submitted', $fromLevel, $nextLevel, $note ?? 'Escalade au niveau supérieur');
    }

    public function approve(Proposal $proposal, User $user, ?string $note = null): void
    {
        if ($proposal->current_level !== 'national') {
            $this->escalate($proposal, $user, $note ?? 'Recommandation positive — transmission au niveau supérieur');
            return;
        }

        $fromStatus = $proposal->status;
        $fromLevel = $proposal->current_level;

        $proposal->update([
            'status'       => 'approved',
            'resolved_at'  => now(),
            'assigned_to'  => $user->id,
        ]);

        $this->recordHistory($proposal, $user, $fromStatus, 'approved', $fromLevel, $fromLevel, $note ?? 'Proposition approuvée');
    }

    public function reject(Proposal $proposal, User $user, ?string $note = null): void
    {
        $fromStatus = $proposal->status;
        $fromLevel = $proposal->current_level;

        $proposal->update([
            'status'      => 'rejected',
            'resolved_at' => now(),
            'assigned_to' => $user->id,
        ]);

        $this->recordHistory($proposal, $user, $fromStatus, 'rejected', $fromLevel, $fromLevel, $note);
    }

    public function requestRevision(Proposal $proposal, User $user, ?string $note = null): void
    {
        $fromStatus = $proposal->status;
        $fromLevel = $proposal->current_level;

        $proposal->update([
            'status'        => 'revision_requested',
            'current_level' => null,
            'assigned_to'   => null,
        ]);

        $this->recordHistory($proposal, $user, $fromStatus, 'revision_requested', $fromLevel, null, $note);
    }

    private function recordHistory(
        Proposal $proposal,
        User $user,
        ?string $fromStatus,
        string $toStatus,
        ?string $fromLevel,
        ?string $toLevel,
        ?string $note,
    ): void {
        $proposal->statusHistories()->create([
            'user_id'     => $user->id,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
            'from_level'  => $fromLevel,
            'to_level'    => $toLevel,
            'note'        => $note,
        ]);
    }
}
