<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersPositions;
use App\Http\Controllers\Controller;
use App\Models\QuestionnaireQuestion;
use App\Models\QuestionnaireSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuestionnaireQuestionController extends Controller
{
    use ReordersPositions;

    protected function rules(Request $request): array
    {
        return [
            'prompt' => ['required', 'string'],
            'help_text' => ['nullable', 'string'],
            'type' => ['required', Rule::in(QuestionnaireQuestion::TYPES)],
            'options' => ['nullable', 'array'],
            'options.*' => ['string'],
            'allow_other' => ['boolean'],
            'is_required' => ['boolean'],
        ];
    }

    public function store(Request $request, QuestionnaireSection $section)
    {
        $data = $request->validate($this->rules($request));

        $position = $this->nextPosition(
            fn () => QuestionnaireQuestion::where('section_id', $section->id)
        );

        $question = $section->questions()->create([...$data, 'position' => $position]);

        return response()->json($question, 201);
    }

    public function update(Request $request, QuestionnaireQuestion $question)
    {
        $data = $request->validate($this->rules($request));

        $question->update($data);

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
