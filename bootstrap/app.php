<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureSellerActive;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\UpdateLastSeen::class,
            \App\Http\Middleware\EnsureSellerActive::class,
        ]);

        $middleware->alias([
            'role'        => EnsureRole::class,
            'portal'      => \App\Http\Middleware\EnsurePortalAccess::class,
            'seller.active' => EnsureSellerActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

