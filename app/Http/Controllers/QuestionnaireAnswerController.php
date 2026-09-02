<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireAnswer;
use App\Models\QuestionnaireQuestion;
use App\Models\QuestionnaireResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class QuestionnaireAnswerController extends Controller
{
    public function update(Request $request, QuestionnaireResponse $response, QuestionnaireQuestion $question)
    {
        Gate::authorize('update', $response);

        abort_if($question->section->questionnaire_id !== $response->questionnaire_id, 404);

        $rules = match ($question->type) {
            'text', 'textarea' => [
                'value.text' => ['nullable', 'string'],
            ],
            'number', 'currency' => [
                'value.number' => ['nullable', 'numeric'],
            ],
            'single_choice', 'multi_choice' => [
                'value.options' => ['array'],
                'value.options.*' => [Rule::in($question->options ?? [])],
                'value.other' => ['nullable', 'string'],
            ],
            default => [],
        };

        $validated = $request->validate($rules);
        $value = $validated['value'] ?? [];

        if ($question->isChoiceType()) {
            if ($question->type === 'single_choice' && count($value['options'] ?? []) > 1) {
                abort(422, 'Esta pergunta aceita apenas uma opção.');
            }

            if (! empty($value['other']) && ! $question->allow_other) {
                abort(422, 'Esta pergunta não permite resposta "Outro".');
            }
        }

        $answer = QuestionnaireAnswer::updateOrCreate(
            ['response_id' => $response->id, 'question_id' => $question->id],
            ['value' => $value]
        );

        return response()->json($answer);
    }
}
