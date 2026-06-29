<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class PortalAccessService
{
    public function groups(): array
    {
        return config('portals.groups', []);
    }

    public function groupKeys(): array
    {
        return array_keys($this->groups());
    }

    public function label(string $portal): string
    {
        return $this->groups()[$portal]['label'] ?? $portal;
    }

    public function redirectFor(string $portal): string
    {
        return $this->groups()[$portal]['redirect'] ?? '/';
    }

    public function groupsForLogin(): array
    {
        return collect($this->groups())->map(fn ($g, $key) => [
            'key'         => $key,
            'label'       => $g['label'],
            'description' => $g['description'],
        ])->values()->all();
    }

    public function assertCanAccess(User $user, string $portal): void
    {
        if (! $this->userCanAccessPortal($user, $portal)) {
            throw ValidationException::withMessages([
                'portal' => 'Votre compte n\'a pas accès au groupe « '.$this->label($portal).' ». Vérifiez le groupe sélectionné.',
            ]);
        }
    }

    public function userCanAccessPortal(User $user, string $portal): bool
    {
        $group = $this->groups()[$portal] ?? null;
        if (! $group) {
            return false;
        }

        if (! in_array($user->role, $group['roles'] ?? [], true)) {
            return false;
        }

        if ($user->role === 'buyer' && $portal === 'citizen') {
            return true;
        }

        if ($user->role !== 'government') {
            return false;
        }

        $profile = $user->governmentProfile;
        if (! $profile) {
            return false;
        }

        $dept = strtolower($profile->department ?? '');

        if (! empty($group['department'])) {
            foreach ($group['department'] as $needle) {
                if (str_contains($dept, strtolower($needle))) {
                    return true;
                }
            }

            return false;
        }

        if (! empty($group['officer_level'])) {
            if (! in_array($profile->officer_level, $group['officer_level'], true)) {
                return false;
            }

            foreach ($group['exclude_department'] ?? [] as $exclude) {
                if (str_contains($dept, strtolower($exclude))) {
                    return false;
                }
            }

            return true;
        }

        return true;
    }

    /** Portail déduit du profil (fallback après connexion sans sélection). */
    public function detectPortalForUser(User $user): ?string
    {
        if ($user->isBuyer()) {
            return 'citizen';
        }

        if (! $user->isGovernment()) {
            return null;
        }

        foreach (array_keys($this->groups()) as $key) {
            if ($key === 'citizen') {
                continue;
            }
            if ($this->userCanAccessPortal($user, $key)) {
                return $key;
            }
        }

        return null;
    }

    public function navItemsForPortal(string $portal): array
    {
        $all = [
            ['key' => 'government.dashboard', 'href' => '/government/dashboard', 'icon' => 'LayoutDashboard', 'portals' => ['commune', 'territory', 'provincial', 'national']],
            ['key' => 'government.expert_review', 'href' => '/government/expert/projects', 'icon' => 'ClipboardCheck', 'portals' => ['expert']],
            ['key' => 'government.tutelage', 'href' => '/government/tutelage/projects', 'icon' => 'Landmark', 'portals' => ['tutelage']],
            ['key' => 'government.all_projects', 'href' => '/projects/archive', 'icon' => 'Archive', 'portals' => ['expert', 'tutelage', 'commune', 'territory', 'provincial', 'national']],
        ];

        return array_values(array_filter($all, fn ($item) => in_array($portal, $item['portals'], true)));
    }

    public function routeRequiresPortal(string $path): ?string
    {
        if (str_starts_with($path, 'projects/archive')) {
            return null;
        }
        if (str_starts_with($path, 'government/expert')) {
            return 'expert';
        }
        if (str_starts_with($path, 'government/tutelage')) {
            return 'tutelage';
        }
        if (str_starts_with($path, 'projects')) {
            return 'citizen';
        }

        return null;
    }

    public function adminPortals(): array
    {
        return ['commune', 'territory', 'provincial', 'national'];
    }

    public function isAdminPortal(string $portal): bool
    {
        return in_array($portal, $this->adminPortals(), true);
    }
}
