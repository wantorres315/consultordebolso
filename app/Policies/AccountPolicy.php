<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    public function view(User $user, Account $account): bool
    {
        return $user->isPlatformAdmin() || $user->account_id === $account->id;
    }

    public function manageMembers(User $user, Account $account): bool
    {
        return $user->isOwner() && $user->account_id === $account->id;
    }
}
