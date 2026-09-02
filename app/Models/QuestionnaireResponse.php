<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['questionnaire_id', 'account_id', 'started_by', 'purchase_status', 'purchase_amount'])]
class QuestionnaireResponse extends Model
{
    protected function casts(): array
    {
        return [
            'finalized_at' => 'datetime',
            'purchase_amount' => 'decimal:2',
        ];
    }

    public function questionnaire(): BelongsTo
    {
        return $this->belongsTo(Questionnaire::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function startedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'started_by');
    }

    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuestionnaireAnswer::class, 'response_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isLocked(): bool
    {
        return $this->status === 'finalized';
    }

    public function isPurchased(): bool
    {
        return $this->purchase_status === 'paid';
    }
}
