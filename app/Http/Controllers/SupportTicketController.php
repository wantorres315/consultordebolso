<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Notifications\NewSupportTicketNotification;
use App\Notifications\SupportTicketOpenedNotification;
use App\Notifications\SupportTicketReplyNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        $tickets = $account->supportTickets()
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
            'attachments' => ['sometimes', 'array', 'max:5'],
            'attachments.*' => $this->attachmentRules(),
        ]);

        $ticket = DB::transaction(function () use ($account, $request, $data) {
            $ticket = SupportTicket::create([
                'account_id' => $account->id,
                'opened_by' => $request->user()->id,
                'subject' => $data['subject'],
                'status' => 'open',
                'last_message_at' => now(),
            ]);

            $message = $ticket->messages()->create([
                'user_id' => $request->user()->id,
                'body' => $data['message'],
            ]);

            $this->storeAttachments($message, $request->file('attachments', []));

            return $ticket;
        });

        $ticket->loadMissing(['account:id,name', 'openedBy:id,name']);

        $admins = User::where('is_platform_admin', true)->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewSupportTicketNotification($ticket));
        }

        $request->user()->notify(new SupportTicketOpenedNotification($ticket));

        return response()->json(
            $ticket->load(['messages.user:id,name,is_platform_admin', 'messages.attachments']),
            201
        );
    }

    public function show(Request $request, SupportTicket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'messages.user:id,name,is_platform_admin',
            'messages.attachments',
            'account:id,name',
            'openedBy:id,name',
        ]);

        return response()->json($ticket);
    }

    public function storeMessage(Request $request, SupportTicket $ticket)
    {
        Gate::authorize('update', $ticket);

        abort_if($ticket->isClosed(), 422, 'Este chamado está encerrado.');

        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:5000'],
            'attachments' => ['sometimes', 'array', 'max:5'],
            'attachments.*' => $this->attachmentRules(),
        ]);

        abort_if(
            blank($data['body'] ?? null) && ! $request->hasFile('attachments'),
            422,
            'Escreva uma mensagem ou anexe um arquivo.'
        );

        $message = DB::transaction(function () use ($ticket, $request, $data) {
            $message = $ticket->messages()->create([
                'user_id' => $request->user()->id,
                'body' => $data['body'] ?? '',
            ]);

            $this->storeAttachments($message, $request->file('attachments', []));

            $ticket->update(['last_message_at' => now()]);

            return $message;
        });

        $this->notifyOtherParty($ticket, $request->user());

        return response()->json($message->load('user:id,name,is_platform_admin', 'attachments'), 201);
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        Gate::authorize('update', $ticket);

        $data = $request->validate([
            'status' => ['required', 'in:open,closed'],
        ]);

        if ($data['status'] !== $ticket->status) {
            DB::transaction(function () use ($ticket, $request, $data) {
                $ticket->messages()->create([
                    'user_id' => $request->user()->id,
                    'event' => $data['status'] === 'closed' ? 'closed' : 'reopened',
                    'body' => '',
                ]);

                $ticket->update(['status' => $data['status'], 'last_message_at' => now()]);
            });
        }

        return response()->json($ticket);
    }

    public function downloadAttachment(Request $request, SupportTicketAttachment $attachment)
    {
        Gate::authorize('view', $attachment->message->ticket);

        return Storage::disk('local')->download($attachment->disk_path, $attachment->original_name);
    }

    private function notifyOtherParty(SupportTicket $ticket, User $author): void
    {
        if ($author->isPlatformAdmin()) {
            $ticket->loadMissing('openedBy');
            $ticket->openedBy?->notify(new SupportTicketReplyNotification($ticket));

            return;
        }

        $admins = User::where('is_platform_admin', true)->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new SupportTicketReplyNotification($ticket));
        }
    }

    private function attachmentRules(): array
    {
        return [
            'file',
            'max:10240',
            'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,csv,txt',
        ];
    }

    private function storeAttachments(SupportTicketMessage $message, array $files): void
    {
        foreach ($files as $file) {
            $path = $file->store('support-tickets/'.$message->support_ticket_id, 'local');

            $message->attachments()->create([
                'disk_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }
    }
}
