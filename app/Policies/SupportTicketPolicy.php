<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function view(User $user, SupportTicket $ticket): bool
    {
        return $user->isPlatformAdmin() || $user->account_id === $ticket->account_id;
    }

    public function update(User $user, SupportTicket $ticket): bool
    {
        return $this->view($user, $ticket);
    }
}
