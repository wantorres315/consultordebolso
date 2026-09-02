<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'description', 'price', 'is_active', 'created_by'])]
class Questionnaire extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'price' => 'decimal:2',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(QuestionnaireSection::class)->orderBy('position');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
