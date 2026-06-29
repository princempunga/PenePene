<?php

namespace App\Services;

use App\Models\AdministrativeDivision;
use App\Models\GovernmentProfile;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ProposalScopeService
{
    /** Map officer_level to proposal current_level */
    public const OFFICER_TO_LEVEL = [
        'commune'    => 'commune',
        'territory'  => 'territory',
        'provincial' => 'provincial',
        'national'   => 'national',
    ];

    public function scopeForOfficer(Builder $query, User $user): Builder
    {
        $profile = $user->governmentProfile;

        if (!$profile || !$profile->is_active) {
            return $query->whereRaw('1 = 0');
        }

        $level = self::OFFICER_TO_LEVEL[$profile->officer_level] ?? null;

        if (!$level) {
            return $query->whereRaw('1 = 0');
        }

        $query->whereIn('status', ['submitted', 'under_review']);

        if ($profile->officer_level === 'national') {
            return $query->where('current_level', 'national');
        }

        if (!$profile->division_id) {
            return $query->whereRaw('1 = 0');
        }

        $divisionIds = $this->collectDescendantIds($profile->division_id);

        return $query
            ->where('current_level', $level)
            ->whereIn('division_id', $divisionIds);
    }

    public function canOfficerAccessProposal(User $user, Proposal $proposal): bool
    {
        $profile = $user->governmentProfile;

        if (!$profile || !$profile->is_active) {
            return false;
        }

        $expectedLevel = self::OFFICER_TO_LEVEL[$profile->officer_level] ?? null;

        if ($proposal->current_level !== $expectedLevel) {
            return false;
        }

        if ($profile->officer_level === 'national') {
            return true;
        }

        if (!$profile->division_id) {
            return false;
        }

        $proposal->loadMissing('division');

        return $proposal->division->isDescendantOf($profile->division_id)
            || $proposal->division_id === $profile->division_id;
    }

    /** @return array<int> */
    private function collectDescendantIds(int $rootId): array
    {
        $ids = [$rootId];
        $queue = [$rootId];

        while ($queue) {
            $parentId = array_shift($queue);
            $children = AdministrativeDivision::where('parent_id', $parentId)->pluck('id');

            foreach ($children as $childId) {
                $ids[] = $childId;
                $queue[] = $childId;
            }
        }

        return $ids;
    }

    public function initialReviewLevel(AdministrativeDivision $division): string
    {
        return match ($division->level) {
            'quartier', 'secteur', 'commune' => 'commune',
            'ville', 'territoire' => 'territory',
            'province' => 'provincial',
            default => 'commune',
        };
    }

    public function nextLevel(?string $current): ?string
    {
        return match ($current) {
            'commune'    => 'territory',
            'territory'  => 'provincial',
            'provincial' => 'national',
            default      => null,
        };
    }
}
