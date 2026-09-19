<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

#[Fillable(['prompt', 'help_text', 'type', 'options', 'allow_other', 'is_required', 'position'])]
class QuestionnaireQuestion extends Model
{
    use HasTranslations;

    public const TYPES = ['text', 'textarea', 'number', 'currency', 'single_choice', 'multi_choice'];

    public array $translatable = ['prompt', 'help_text'];

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

    /**
     * Resolve each option's {key, labels} entry down to {key, label} for the
     * given locale, falling back to the app's fallback locale when the
     * current locale hasn't been translated yet.
     */
    public function optionsForLocale(?string $locale = null): array
    {
        $locale ??= app()->getLocale();
        $fallback = config('app.fallback_locale');

        return collect($this->options ?? [])->map(function (array $option) use ($locale, $fallback) {
            $label = $option['labels'][$locale] ?? null;

            if ($label === null || $label === '') {
                $label = $option['labels'][$fallback] ?? '';
            }

            return ['key' => $option['key'], 'label' => $label];
        })->all();
    }
}
