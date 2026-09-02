<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\App;

class NewSupportTicketNotification extends Notification
{
    public function __construct(public SupportTicket $ticket)
    {
        $this->locale = App::getLocale();
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(trans('notifications.support_ticket.admin_subject', ['subject' => $this->ticket->subject], $this->locale))
            ->line(trans('notifications.support_ticket.admin_intro', [
                'name' => $this->ticket->openedBy?->name ?? '',
                'account' => $this->ticket->account->name,
            ], $this->locale))
            ->action(
                trans('notifications.support_ticket.view_action', [], $this->locale),
                url('/admin/suporte/'.$this->ticket->id)
            );
    }
}
