<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function impersonate(User $actor, User $target): bool
    {
        if ($target->is_platform_admin || $target->id === $actor->id) {
            return false;
        }

        return $actor->isPlatformAdmin();
    }
}
