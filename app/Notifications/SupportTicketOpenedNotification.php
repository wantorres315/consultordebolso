<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\App;

class SupportTicketOpenedNotification extends Notification
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
            ->subject(trans('notifications.support_ticket.client_subject', ['subject' => $this->ticket->subject], $this->locale))
            ->greeting(trans('notifications.support_ticket.client_greeting', ['name' => $notifiable->name], $this->locale))
            ->line(trans('notifications.support_ticket.client_intro', [], $this->locale))
            ->action(
                trans('notifications.support_ticket.view_action', [], $this->locale),
                url('/dono/suporte/'.$this->ticket->id)
            );
    }
}
