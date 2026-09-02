<?php

return [
    'invitation' => [
        'greeting' => 'Hello, :name!',
        'subject' => 'Invitation to join the ":account" account',
        'owner_intro' => 'You have been invited to create the ":account" account on Consultor de Bolso.',
        'member_intro' => 'You have been invited to join the ":account" account on Consultor de Bolso.',
        'action' => 'Accept invitation',
        'expires' => 'This invitation expires on :date.',
    ],
    'support_ticket' => [
        'view_action' => 'Open ticket',
        'admin_subject' => 'New support ticket: :subject',
        'admin_intro' => ':name (:account) opened a new support ticket.',
        'client_subject' => 'We received your ticket: :subject',
        'client_greeting' => 'Hello, :name!',
        'client_intro' => 'We received your support ticket and our team will get back to you soon.',
        'reply_subject' => 'New reply on your ticket: :subject',
        'reply_intro' => 'Your support ticket has a new reply. Open it here to see it.',
    ],
];
