<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\FiltersTranslations;
use App\Http\Controllers\Admin\Concerns\ReordersPositions;
use App\Http\Controllers\Controller;
use App\Models\Questionnaire;
use App\Models\QuestionnaireSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionnaireSectionController extends Controller
{
    use FiltersTranslations, ReordersPositions;

    private const TRANSLATABLE_FIELDS = ['title', 'objective'];

    public function store(Request $request, Questionnaire $questionnaire)
    {
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.pt_BR' => ['required', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'title.es' => ['nullable', 'string', 'max:255'],
            'objective' => ['nullable', 'array'],
            'objective.pt_BR' => ['nullable', 'string'],
            'objective.en' => ['nullable', 'string'],
            'objective.es' => ['nullable', 'string'],
        ]);

        $data['title'] = $this->cleanTranslations($data['title']);
        $data['objective'] = $this->cleanTranslations($data['objective'] ?? []);

        $position = $this->nextPosition(
            fn () => QuestionnaireSection::where('questionnaire_id', $questionnaire->id)
        );

        $section = $questionnaire->sections()->create([...$data, 'position' => $position]);
        $section->translations = $this->translationsFor($section, self::TRANSLATABLE_FIELDS);

        return response()->json($section, 201);
    }

    public function update(Request $request, QuestionnaireSection $section)
    {
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.pt_BR' => ['required', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'title.es' => ['nullable', 'string', 'max:255'],
            'objective' => ['nullable', 'array'],
            'objective.pt_BR' => ['nullable', 'string'],
            'objective.en' => ['nullable', 'string'],
            'objective.es' => ['nullable', 'string'],
        ]);

        $data['title'] = $this->cleanTranslations($data['title']);
        $data['objective'] = $this->cleanTranslations($data['objective'] ?? []);

        $section->update($data);
        $section->translations = $this->translationsFor($section, self::TRANSLATABLE_FIELDS);

        return response()->json($section);
    }

    public function destroy(QuestionnaireSection $section)
    {
        $questionnaireId = $section->questionnaire_id;

        DB::transaction(function () use ($section, $questionnaireId) {
            $section->delete();

            $this->renumberSiblings(
                fn () => QuestionnaireSection::where('questionnaire_id', $questionnaireId)
            );
        });

        return response()->noContent();
    }

    public function moveUp(QuestionnaireSection $section)
    {
        $this->moveItem(
            $section,
            fn () => QuestionnaireSection::where('questionnaire_id', $section->questionnaire_id),
            'up'
        );

        return response()->json($section->fresh());
    }

    public function moveDown(QuestionnaireSection $section)
    {
        $this->moveItem(
            $section,
            fn () => QuestionnaireSection::where('questionnaire_id', $section->questionnaire_id),
            'down'
        );

        return response()->json($section->fresh());
    }
}
