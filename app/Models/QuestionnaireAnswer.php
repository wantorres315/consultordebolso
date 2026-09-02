<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['response_id', 'question_id', 'value'])]
class QuestionnaireAnswer extends Model
{
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public function response(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireResponse::class, 'response_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireQuestion::class, 'question_id');
    }

    public function isEmpty(): bool
    {
        $value = $this->value ?? [];

        $text = trim((string) ($value['text'] ?? ''));
        $number = $value['number'] ?? null;
        $options = $value['options'] ?? [];
        $other = trim((string) ($value['other'] ?? ''));

        return $text === '' && $number === null && empty($options) && $other === '';
    }
}
