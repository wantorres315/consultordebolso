<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->api(prepend: [
            \App\Http\Middleware\SetLocale::class,
        ]);

        $middleware->alias([
            'platform.admin' => \App\Http\Middleware\EnsurePlatformAdmin::class,
            'subscription.active' => \App\Http\Middleware\EnsureSubscriptionActive::class,
        ]);

        // This is an API-only backend (no server-rendered "login" page to redirect
        // guests to), so unauthenticated requests should always surface as a JSON
        // 401 instead of Laravel's default guest redirect to a nonexistent route.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
