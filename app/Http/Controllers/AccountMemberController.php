<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AccountMemberController extends Controller
{
    public function destroy(Request $request, User $user)
    {
        abort_if(! $user->account_id, 404);

        Gate::authorize('manageMembers', $user->account);

        abort_if($user->isOwner(), 422, 'O dono da conta não pode ser removido.');

        $user->account_id = null;
        $user->role = null;
        $user->save();

        return response()->noContent();
    }
}
