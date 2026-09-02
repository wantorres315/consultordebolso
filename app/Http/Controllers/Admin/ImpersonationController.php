<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Impersonation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ImpersonationController extends Controller
{
    public function store(Request $request, User $user)
    {
        Gate::authorize('impersonate', $user);

        // If we're already impersonating, chain back to the original account
        // instead of the currently-impersonated one, and close out that hop's
        // audit record — "voltar" must always land on the true original.
        $originalId = $request->session()->get('impersonator_id');

        if ($originalId) {
            Impersonation::whereKey($request->session()->get('impersonation_id'))
                ->update(['ended_at' => now()]);
        } else {
            $originalId = $request->user()->id;
        }

        $admin = User::findOrFail($originalId);

        $impersonation = Impersonation::create([
            'admin_id' => $admin->id,
            'user_id' => $user->id,
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $request->session()->put('impersonator_id', $admin->id);
        $request->session()->put('impersonation_id', $impersonation->id);

        return response()->json(['user' => $user->load('account')]);
    }

    public function destroy(Request $request)
    {
        $impersonatorId = $request->session()->get('impersonator_id');

        abort_unless($impersonatorId, 409);

        $admin = User::findOrFail($impersonatorId);

        Impersonation::whereKey($request->session()->get('impersonation_id'))
            ->update(['ended_at' => now()]);

        Auth::guard('web')->login($admin);
        $request->session()->regenerate();
        $request->session()->forget(['impersonator_id', 'impersonation_id']);

        return response()->json(['user' => $admin->load('account')]);
    }
}
