<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PortalAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Seller;

class LoginController extends Controller
{
    public function __construct(private PortalAccessService $portals) {}

    public function create(Request $request)
    {
        return Inertia::render('Auth/Login', [
            'redirect' => $this->sanitizeRedirect($request->query('redirect')),
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

        // Reactivate account on login
        if ($user->isSeller()) {
            $seller = $user->seller;
            if ($seller && $seller->status === 'suspended') {
                $seller->update(['status' => 'verified']);
            }
        }

        if ($user->role === 'buyer' && !$user->is_active) {
            $user->update(['is_active' => true]);
        }

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

    private function sanitizeRedirect(?string $redirect): ?string
    {
        if (! $redirect || ! str_starts_with($redirect, '/') || str_starts_with($redirect, '//')) {
            return null;
        }

        return $redirect;
    }
}
