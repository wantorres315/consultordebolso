<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccountInvitation;
use App\Models\User;
use App\Notifications\AccountInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class AccountInvitationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'account_name' => ['required', 'string', 'max:255'],
        ]);

        if (User::where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'Este e-mail já está associado a uma conta.',
            ], 422);
        }

        if (AccountInvitation::whereNull('accepted_at')->where('expires_at', '>', now())
            ->where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'Já existe um convite pendente para este e-mail.',
            ], 422);
        }

        $invitation = AccountInvitation::create([
            'email' => $validated['email'],
            'account_name' => $validated['account_name'],
            'invited_by' => $request->user()->id,
            'role' => 'owner',
        ]);

        Notification::route('mail', $invitation->email)
            ->notify(new AccountInvitationNotification($invitation));

        return response()->json(['invitation' => $invitation], 201);
    }
}
