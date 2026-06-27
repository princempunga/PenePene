<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\DemoSimulationService;
use App\Services\PortalAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function __construct(private PortalAccessService $portals) {}

    public function create(Request $request)
    {
        return Inertia::render('Auth/Login', [
            'redirect' => $this->sanitizeRedirect($request->query('redirect')),
            'demo_enabled' => config('app.debug', false),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'portal'   => 'nullable|in:'.implode(',', $this->portals->groupKeys()),
        ]);

        if (! Auth::attempt([
            'email'    => $validated['email'],
            'password' => $validated['password'],
        ], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Identifiants incorrects.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $user->update(['is_online' => true, 'last_seen_at' => now()]);

        // Auto-detect portal if not provided (for PenePene marketplace users)
        $portal = $validated['portal'] ?? $this->portals->detectPortalForUser($user);

        if ($portal) {
            try {
                $this->portals->assertCanAccess($user, $portal);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors($e->errors())->onlyInput('email');
            }

            session(['active_portal' => $portal]);
        }

        $redirect = $this->sanitizeRedirect($request->input('redirect'));
        if ($redirect) {
            return redirect()->to($redirect);
        }

        // Redirect based on user role for PenePene marketplace
        if ($user->isBuyer()) {
            return redirect()->route('buyer.dashboard');
        }

        if ($user->isSeller()) {
            return redirect()->route('seller.dashboard');
        }

        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($portal) {
            return redirect()->to($this->portals->redirectFor($portal));
        }

        return redirect()->route('home');
    }

    public function destroy(Request $request)
    {
        if (Auth::check()) {
            Auth::user()->update(['is_online' => false, 'last_seen_at' => now()]);
        }

        Auth::logout();
        $request->session()->forget('active_portal');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function demoLogin(Request $request)
    {
        abort_unless(DemoSimulationService::enabled(), 404);

        $portal = $request->validate([
            'portal' => 'required|in:'.implode(',', $this->portals->groupKeys()),
            'role'   => 'nullable|string',
        ])['portal'];

        $accounts = [
            'citizen'   => 'buyer@penepene.co.tz',
            'expert'    => 'expert@rdc.gov.cd',
            'tutelage'  => 'tutelage@rdc.gov.cd',
            'commune'   => 'commune@rdc.gov.cd',
            'territory' => 'ville@rdc.gov.cd',
            'provincial'=> 'province@rdc.gov.cd',
            'national'  => 'national@rdc.gov.cd',
        ];

        $email = $accounts[$portal] ?? null;
        if (! $email || ! Auth::attempt(['email' => $email, 'password' => 'password'], true)) {
            return back()->withErrors(['portal' => 'Compte démo indisponible. Exécutez les seeders.']);
        }

        $request->session()->regenerate();
        session(['active_portal' => $portal]);

        $user = Auth::user();
        $user->update(['is_online' => true, 'last_seen_at' => now()]);

        return redirect()->to($this->portals->redirectFor($portal));
    }

    private function sanitizeRedirect(?string $redirect): ?string
    {
        if (! $redirect || ! str_starts_with($redirect, '/') || str_starts_with($redirect, '//')) {
            return null;
        }

        return $redirect;
    }
}
