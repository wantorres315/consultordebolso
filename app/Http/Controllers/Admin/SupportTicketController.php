<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = SupportTicket::query()
            ->with(['account:id,name', 'openedBy:id,name'])
            ->withCount('messages')
            ->when(
                $request->query('status'),
                fn ($query, $status) => $query->where('status', $status)
            )
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return response()->json($tickets);
    }
}
