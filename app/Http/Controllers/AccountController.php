<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AccountController extends Controller
{
    public function show(Request $request)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        Gate::authorize('view', $account);

        $account->load('owner:id,name,email', 'members:id,account_id,name,email', 'plan');

        $isOwner = $request->user()->isOwner();

        if ($isOwner) {
            $account->load('pendingInvitations');
        }

        return response()->json([
            'account' => $account,
            'seats' => [
                'used' => $account->occupiedSeats(),
                'max' => $account->maxMembers(),
            ],
            'wallet_plan_credits' => $account->walletPlanCreditsSummary(),
            'wallet_plan_credits_history' => $isOwner ? $account->walletPlanCreditsHistory() : null,
            'billing_cycle' => $account->billingCycleSummary(),
        ]);
    }
}
