<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\FiltersTranslations;
use App\Http\Controllers\Admin\Concerns\ReordersPositions;
use App\Http\Controllers\Controller;
use App\Models\QuestionnaireQuestion;
use App\Models\QuestionnaireSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuestionnaireQuestionController extends Controller
{
    use FiltersTranslations, ReordersPositions;

    private const TRANSLATABLE_FIELDS = ['prompt', 'help_text'];

    protected function rules(Request $request): array
    {
        return [
            'prompt' => ['required', 'array'],
            'prompt.pt_BR' => ['required', 'string'],
            'prompt.en' => ['nullable', 'string'],
            'prompt.es' => ['nullable', 'string'],
            'help_text' => ['nullable', 'array'],
            'help_text.pt_BR' => ['nullable', 'string'],
            'help_text.en' => ['nullable', 'string'],
            'help_text.es' => ['nullable', 'string'],
            'type' => ['required', Rule::in(QuestionnaireQuestion::TYPES)],
            'options' => ['nullable', 'array'],
            'options.*.key' => ['required', 'string'],
            'options.*.labels' => ['required', 'array'],
            'options.*.labels.pt_BR' => ['required', 'string', 'max:255'],
            'options.*.labels.en' => ['nullable', 'string', 'max:255'],
            'options.*.labels.es' => ['nullable', 'string', 'max:255'],
            'allow_other' => ['boolean'],
            'is_required' => ['boolean'],
        ];
    }

    public function store(Request $request, QuestionnaireSection $section)
    {
        $data = $request->validate($this->rules($request));

        $data['prompt'] = $this->cleanTranslations($data['prompt']);
        $data['help_text'] = $this->cleanTranslations($data['help_text'] ?? []);

        $position = $this->nextPosition(
            fn () => QuestionnaireQuestion::where('section_id', $section->id)
        );

        $question = $section->questions()->create([...$data, 'position' => $position]);
        $question->translations = $this->translationsFor($question, self::TRANSLATABLE_FIELDS);

        return response()->json($question, 201);
    }

    public function update(Request $request, QuestionnaireQuestion $question)
    {
        $data = $request->validate($this->rules($request));

        $data['prompt'] = $this->cleanTranslations($data['prompt']);
        $data['help_text'] = $this->cleanTranslations($data['help_text'] ?? []);

        $question->update($data);
        $question->translations = $this->translationsFor($question, self::TRANSLATABLE_FIELDS);

        return response()->json($question);
    }

    public function destroy(QuestionnaireQuestion $question)
    {
        $sectionId = $question->section_id;

        DB::transaction(function () use ($question, $sectionId) {
            $question->delete();

            $this->renumberSiblings(
                fn () => QuestionnaireQuestion::where('section_id', $sectionId)
            );
        });

        return response()->noContent();
    }

    public function moveUp(QuestionnaireQuestion $question)
    {
        $this->moveItem(
            $question,
            fn () => QuestionnaireQuestion::where('section_id', $question->section_id),
            'up'
        );

        return response()->json($question->fresh());
    }

    public function moveDown(QuestionnaireQuestion $question)
    {
        $this->moveItem(
            $question,
            fn () => QuestionnaireQuestion::where('section_id', $question->section_id),
            'down'
        );

        return response()->json($question->fresh());
    }
}
