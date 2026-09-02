<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Questionnaire;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    public function index()
    {
        $questionnaires = Questionnaire::query()
            ->withCount(['sections', 'responses'])
            ->latest()
            ->get();

        return response()->json($questionnaires);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $questionnaire = Questionnaire::create([...$data, 'created_by' => $request->user()->id]);

        return response()->json($questionnaire, 201);
    }

    public function show(Questionnaire $questionnaire)
    {
        $questionnaire->load(['sections.questions' => function ($query) {
            $query->withCount('answers');
        }]);

        return response()->json($questionnaire);
    }

    public function update(Request $request, Questionnaire $questionnaire)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $questionnaire->update($data);

        return response()->json($questionnaire);
    }

    public function destroy(Questionnaire $questionnaire)
    {
        abort_if(
            $questionnaire->responses()->exists(),
            422,
            'Este questionário já possui respostas e não pode ser excluído.'
        );

        $questionnaire->delete();

        return response()->noContent();
    }
}
