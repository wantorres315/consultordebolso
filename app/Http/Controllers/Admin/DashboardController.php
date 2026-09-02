<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AccountInvitation;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'accounts_count' => Account::count(),
            'members_count' => User::where('role', 'member')->count(),
            'pending_invitations_count' => AccountInvitation::whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->count(),
            'recent_accounts' => Account::with('owner:id,name,email')->latest()->take(5)->get(),
        ]);
    }
}
