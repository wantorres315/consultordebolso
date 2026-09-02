<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersPositions;
use App\Http\Controllers\Controller;
use App\Models\Questionnaire;
use App\Models\QuestionnaireSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionnaireSectionController extends Controller
{
    use ReordersPositions;

    public function store(Request $request, Questionnaire $questionnaire)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string'],
        ]);

        $position = $this->nextPosition(
            fn () => QuestionnaireSection::where('questionnaire_id', $questionnaire->id)
        );

        $section = $questionnaire->sections()->create([...$data, 'position' => $position]);

        return response()->json($section, 201);
    }

    public function update(Request $request, QuestionnaireSection $section)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string'],
        ]);

        $section->update($data);

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
