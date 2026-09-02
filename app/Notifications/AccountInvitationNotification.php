<?php

namespace App\Notifications;

use App\Models\AccountInvitation;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\App;

class AccountInvitationNotification extends Notification
{
    public function __construct(public AccountInvitation $invitation)
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
        $accountName = $this->invitation->isOwnerInvite()
            ? $this->invitation->account_name
            : $this->invitation->account->name;

        $introKey = $this->invitation->isOwnerInvite()
            ? 'notifications.invitation.owner_intro'
            : 'notifications.invitation.member_intro';

        $mail = (new MailMessage)
            ->subject(trans('notifications.invitation.subject', ['account' => $accountName], $this->locale));

        if ($this->invitation->name) {
            $mail->greeting(trans('notifications.invitation.greeting', ['name' => $this->invitation->name], $this->locale));
        }

        return $mail
            ->line(trans($introKey, ['account' => $accountName], $this->locale))
            ->action(
                trans('notifications.invitation.action', [], $this->locale),
                url('/convite/'.$this->invitation->token)
            )
            ->line(trans('notifications.invitation.expires', [
                'date' => $this->invitation->expires_at->format('d/m/Y'),
            ], $this->locale));
    }
}
