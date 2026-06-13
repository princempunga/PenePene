<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Auth/Login', [
            'redirect' => $this->sanitizeRedirect($request->query('redirect')),
        ]);
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();
            $user->update(['is_online' => true, 'last_seen_at' => now()]);

            $redirect = $this->sanitizeRedirect($request->input('redirect'));
            if ($redirect) {
                return redirect()->to($redirect);
            }

            $fallback = match ($user->role) {
                'super_admin', 'admin' => route('admin.dashboard'),
                'seller'               => route('seller.dashboard'),
                default                => route('cart.index'),
            };

            return redirect()->intended($fallback);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        if (Auth::check()) {
            Auth::user()->update(['is_online' => false, 'last_seen_at' => now()]);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    private function sanitizeRedirect(?string $redirect): ?string
    {
        if (! $redirect || ! str_starts_with($redirect, '/') || str_starts_with($redirect, '//')) {
            return null;
        }

        return $redirect;
    }
}
