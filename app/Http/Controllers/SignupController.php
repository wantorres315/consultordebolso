<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SignupController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'billing_period' => ['required', 'string', 'in:monthly,annual'],
            'account_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        abort_unless($plan->is_active, 422, 'Este plano não está mais disponível.');

        $user = DB::transaction(function () use ($validated, $plan) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $account = Account::create([
                'name' => $validated['account_name'],
                'owner_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_period' => $validated['billing_period'],
                'subscription_status' => 'pending_payment',
            ]);

            $user->account_id = $account->id;
            $user->role = 'owner';
            $user->save();

            return $user;
        });

        Auth::login($user);

        $request->session()->regenerate();

        return response()->json(['user' => $user->load('account')], 201);
    }
}
