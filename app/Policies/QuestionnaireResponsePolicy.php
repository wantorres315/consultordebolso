<?php

namespace App\Policies;

use App\Models\QuestionnaireResponse;
use App\Models\User;

class QuestionnaireResponsePolicy
{
    public function view(User $user, QuestionnaireResponse $response): bool
    {
        return $user->account_id === $response->account_id;
    }

    public function update(User $user, QuestionnaireResponse $response): bool
    {
        return $user->account_id === $response->account_id && $response->isDraft();
    }
}
