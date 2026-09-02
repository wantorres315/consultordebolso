<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'account_id',
    'questionnaire_response_id',
    'description',
    'type',
    'method',
    'mercadopago_payment_id',
    'amount',
    'currency',
    'status',
    'paid_at',
    'notes',
])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function questionnaireResponse(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireResponse::class);
    }
}
