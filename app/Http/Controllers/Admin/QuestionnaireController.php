<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\FiltersTranslations;
use App\Http\Controllers\Controller;
use App\Models\Questionnaire;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    use FiltersTranslations;

    private const TRANSLATABLE_FIELDS = ['title', 'description'];

    public function index()
    {
        $questionnaires = Questionnaire::query()
            ->withCount(['sections', 'responses'])
            ->latest()
            ->get()
            ->each(fn (Questionnaire $questionnaire) => $questionnaire->translations = $this->translationsFor(
                $questionnaire, self::TRANSLATABLE_FIELDS
            ));

        return response()->json($questionnaires);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.pt_BR' => ['required', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'title.es' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.pt_BR' => ['nullable', 'string'],
            'description.en' => ['nullable', 'string'],
            'description.es' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $data['title'] = $this->cleanTranslations($data['title']);
        $data['description'] = $this->cleanTranslations($data['description'] ?? []);

        $questionnaire = Questionnaire::create([...$data, 'created_by' => $request->user()->id]);
        $questionnaire->translations = $this->translationsFor($questionnaire, self::TRANSLATABLE_FIELDS);

        return response()->json($questionnaire, 201);
    }

    public function show(Questionnaire $questionnaire)
    {
        $questionnaire->load(['sections.questions' => function ($query) {
            $query->withCount('answers');
        }]);

        $questionnaire->translations = $this->translationsFor($questionnaire, self::TRANSLATABLE_FIELDS);

        foreach ($questionnaire->sections as $section) {
            $section->translations = $this->translationsFor($section, ['title', 'objective']);

            foreach ($section->questions as $question) {
                $question->translations = $this->translationsFor($question, ['prompt', 'help_text']);
            }
        }

        return response()->json($questionnaire);
    }

    public function update(Request $request, Questionnaire $questionnaire)
    {
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.pt_BR' => ['required', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'title.es' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.pt_BR' => ['nullable', 'string'],
            'description.en' => ['nullable', 'string'],
            'description.es' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $data['title'] = $this->cleanTranslations($data['title']);
        $data['description'] = $this->cleanTranslations($data['description'] ?? []);

        $questionnaire->update($data);
        $questionnaire->translations = $this->translationsFor($questionnaire, self::TRANSLATABLE_FIELDS);

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
