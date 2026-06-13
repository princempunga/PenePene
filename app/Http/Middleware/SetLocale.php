<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('locales.supported', ['fr']);
        $locale = config('locales.default', 'fr');

        if ($request->user()?->locale && in_array($request->user()->locale, $supported, true)) {
            $locale = $request->user()->locale;
        } elseif ($request->hasSession()
            && $request->session()->has('locale')
            && in_array($request->session()->get('locale'), $supported, true)) {
            $locale = $request->session()->get('locale');
        }

        App::setLocale($locale);

        return $next($request);
    }
}
