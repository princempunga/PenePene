<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsureSellerActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'seller') {
            $seller = $user->seller;

            if (!$seller) {
                return redirect('/login?message=suspended');
            }

            // Auto-deactivate if inactive for 30+ days
            if ($seller->status === 'verified' || $seller->status === 'active') {
                $lastSeen = $user->last_seen_at ?? $user->updated_at;
                if ($lastSeen && $lastSeen->diffInDays(now()) >= 30) {
                    $seller->update(['status' => 'suspended']);
                    if ($request->expectsJson()) {
                        abort(403, 'Your seller account has been suspended due to inactivity.');
                    }
                    return redirect('/login?message=suspended');
                }
            }

            if (in_array($seller->status, ['suspended', 'blocked', 'rejected'])) {
                if ($request->expectsJson()) {
                    abort(403, 'Your seller account has been suspended or blocked.');
                }
                return redirect('/login?message=suspended');
            }
        }

        return $next($request);
    }
}
