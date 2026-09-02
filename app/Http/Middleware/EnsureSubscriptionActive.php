<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $account = $request->user()?->account;

        if ($account && $account->plan_id && $account->subscription_status !== 'active') {
            abort(403, 'Pagamento pendente.');
        }

        return $next($request);
    }
}
