<?php

namespace App\Http\Middleware;

use App\Services\PortalAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalAccess
{
    public function __construct(private PortalAccessService $portals) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $activePortal = session('active_portal');
        if (! $activePortal) {
            $activePortal = $this->portals->detectPortalForUser($user);
            if ($activePortal) {
                session(['active_portal' => $activePortal]);
            }
        }

        if (! $activePortal) {
            return $next($request);
        }

        $required = $this->portals->routeRequiresPortal(ltrim($request->path(), '/'));
        if ($required === null) {
            return $next($request);
        }

        if ($required === 'citizen' && $activePortal === 'citizen') {
            return $next($request);
        }

        if ($required === 'expert' && $activePortal !== 'expert') {
            return redirect($this->portals->redirectFor($activePortal))
                ->withErrors(['error' => 'Accès réservé au groupe d\'experts.']);
        }

        if ($required === 'tutelage' && $activePortal !== 'tutelage') {
            return redirect($this->portals->redirectFor($activePortal))
                ->withErrors(['error' => 'Accès réservé au service de tutelle.']);
        }

        if ($required === 'citizen' && $activePortal !== 'citizen') {
            return redirect($this->portals->redirectFor($activePortal))
                ->withErrors(['error' => 'Accès réservé aux citoyens concepteurs.']);
        }

        return $next($request);
    }
}
