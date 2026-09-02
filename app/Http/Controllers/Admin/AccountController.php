<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Payment;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::query()
            ->with(['owner:id,name,email', 'members:id,account_id,name,email', 'plan:id,name'])
            ->withCount('members', 'pendingInvitations')
            ->latest()
            ->paginate(20);

        return response()->json($accounts);
    }

    public function show(Account $account)
    {
        $account->load([
            'owner:id,name,email',
            'members:id,account_id,name,email',
            'pendingInvitations:id,account_id,email,expires_at',
            'plan',
        ]);

        return response()->json([
            'account' => $account,
            'seats' => [
                'used' => $account->occupiedSeats(),
                'max' => $account->maxMembers(),
            ],
            'wallet_plan_credits' => $account->walletPlanCreditsSummary(),
            'wallet_plan_credits_history' => $account->walletPlanCreditsHistory(),
        ]);
    }

    public function approvePayment(Account $account)
    {
        $account->load('plan');
        $account->update(['subscription_status' => 'active']);

        if ($account->plan) {
            $amount = $account->billing_period === 'annual'
                ? $account->plan->annual_price
                : $account->plan->monthly_price;

            Payment::create([
                'account_id' => $account->id,
                'type' => 'subscription',
                'method' => 'manual',
                'amount' => $amount,
                'currency' => 'BRL',
                'status' => 'approved',
                'paid_at' => now(),
                'notes' => 'Aprovado manualmente pelo admin.',
            ]);
        }

        return response()->json($account);
    }
}
