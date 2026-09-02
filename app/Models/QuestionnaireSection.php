<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'objective', 'position'])]
class QuestionnaireSection extends Model
{
    public function questionnaire(): BelongsTo
    {
        return $this->belongsTo(Questionnaire::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuestionnaireQuestion::class, 'section_id')->orderBy('position');
    }
}
