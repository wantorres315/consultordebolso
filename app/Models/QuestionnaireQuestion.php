<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['prompt', 'help_text', 'type', 'options', 'allow_other', 'is_required', 'position'])]
class QuestionnaireQuestion extends Model
{
    public const TYPES = ['text', 'textarea', 'number', 'currency', 'single_choice', 'multi_choice'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'allow_other' => 'boolean',
            'is_required' => 'boolean',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireSection::class, 'section_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuestionnaireAnswer::class, 'question_id');
    }

    public function isChoiceType(): bool
    {
        return in_array($this->type, ['single_choice', 'multi_choice'], true);
    }
}
