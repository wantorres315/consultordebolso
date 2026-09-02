<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountInvitation;
use App\Models\User;
use App\Notifications\AccountInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rules\Password;

class AccountInvitationController extends Controller
{
    public function store(Request $request)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        Gate::authorize('manageMembers', $account);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        if (! $account->canInviteMore()) {
            return response()->json([
                'message' => 'Esta conta já atingiu o limite de '.$account->maxMembers().' usuários.',
            ], 422);
        }

        if (User::where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'Este e-mail já está associado a uma conta.',
            ], 422);
        }

        if ($account->pendingInvitations()->where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'Já existe um convite pendente para este e-mail.',
            ], 422);
        }

        $invitation = $account->invitations()->create([
            'email' => $validated['email'],
            'name' => $validated['name'],
            'invited_by' => $request->user()->id,
            'role' => 'member',
        ]);

        Notification::route('mail', $invitation->email)
            ->notify(new AccountInvitationNotification($invitation));

        return response()->json(['invitation' => $invitation], 201);
    }

    public function destroy(Request $request, AccountInvitation $invitation)
    {
        abort_if($invitation->isOwnerInvite(), 404);

        Gate::authorize('manageMembers', $invitation->account);

        abort_if($invitation->isAccepted(), 422, 'Este convite já foi aceito.');

        $invitation->delete();

        return response()->noContent();
    }

    public function show(string $token)
    {
        $invitation = AccountInvitation::where('token', $token)->with('account:id,name')->firstOrFail();

        return response()->json([
            'invitation' => [
                'email' => $invitation->email,
                'name' => $invitation->name,
                'account_name' => $invitation->isOwnerInvite() ? $invitation->account_name : $invitation->account->name,
                'role' => $invitation->role,
                'expired' => $invitation->isExpired(),
                'accepted' => $invitation->isAccepted(),
            ],
        ]);
    }

    public function accept(Request $request, string $token)
    {
        $invitation = AccountInvitation::where('token', $token)->firstOrFail();

        abort_if($invitation->isAccepted(), 422, 'Este convite já foi aceito.');
        abort_if($invitation->isExpired(), 422, 'Este convite expirou.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (User::where('email', $invitation->email)->exists()) {
            return response()->json([
                'message' => 'Este e-mail já está associado a uma conta.',
            ], 422);
        }

        $user = DB::transaction(function () use ($invitation, $validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $invitation->email,
                'password' => Hash::make($validated['password']),
            ]);

            if ($invitation->isOwnerInvite()) {
                $account = Account::create([
                    'name' => $invitation->account_name,
                    'owner_id' => $user->id,
                ]);

                $user->account_id = $account->id;
            } else {
                $user->account_id = $invitation->account_id;
            }

            $user->role = $invitation->role;
            $user->save();

            $invitation->accepted_at = now();
            $invitation->save();

            return $user;
        });

        Auth::login($user);

        $request->session()->regenerate();

        return response()->json(['user' => $user->load('account')], 201);
    }
}
