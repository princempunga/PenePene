<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'seller') {
            $seller = $user->seller;

            if (!$seller || in_array($seller->status, ['suspended', 'blocked', 'rejected'])) {
                if ($request->expectsJson()) {
                    abort(403, 'Your seller account has been suspended or blocked.');
                }

                return redirect('/login?message=suspended');
            }
        }

        return $next($request);
    }
}
