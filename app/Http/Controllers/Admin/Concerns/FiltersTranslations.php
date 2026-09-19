<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Model;

trait FiltersTranslations
{
    /**
     * Strip blank/null locale values before persisting a translatable
     * attribute. Spatie's fallback only kicks in when a locale key is
     * absent — an empty string saved for "en" would otherwise render blank
     * instead of falling back to pt_BR.
     */
    protected function cleanTranslations(array $value): array
    {
        return array_filter($value, fn ($v) => $v !== null && trim((string) $v) !== '');
    }

    /**
     * Build the full per-locale map for each translatable field, so the
     * admin builder can edit every language at once.
     */
    protected function translationsFor(Model $model, array $fields): array
    {
        return collect($fields)->mapWithKeys(fn ($field) => [$field => $model->getTranslations($field)])->all();
    }
}
