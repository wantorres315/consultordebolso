<?php

namespace App\Http\Controllers;

use App\Models\Questionnaire;
use App\Models\QuestionnaireQuestion;
use App\Models\QuestionnaireResponse;
use App\Services\FakeConsultantAi;
use App\Services\MercadoPagoClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class QuestionnaireResponseController extends Controller
{
    public function index(Request $request, Questionnaire $questionnaire)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        $totalQuestions = QuestionnaireQuestion::whereHas(
            'section',
            fn ($query) => $query->where('questionnaire_id', $questionnaire->id)
        )->count();

        $responses = $questionnaire->responses()
            ->where('account_id', $account->id)
            ->with('answers')
            ->latest()
            ->get()
            ->map(function (QuestionnaireResponse $response) use ($totalQuestions) {
                $response->total_questions = $totalQuestions;
                $response->answered_count = $response->answers->filter(fn ($answer) => ! $answer->isEmpty())->count();

                return $response;
            });

        return response()->json($responses);
    }

    public function store(Request $request, Questionnaire $questionnaire)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        $draft = QuestionnaireResponse::where('questionnaire_id', $questionnaire->id)
            ->where('account_id', $account->id)
            ->where('status', 'draft')
            ->first();

        if ($draft) {
            return response()->json($draft, 200);
        }

        abort_if(! $questionnaire->is_active, 422, 'Este questionário não está mais disponível.');

        $response = new QuestionnaireResponse([
            'questionnaire_id' => $questionnaire->id,
            'account_id' => $account->id,
            'started_by' => $request->user()->id,
        ]);
        $response->status = 'draft';
        $response->save();

        return response()->json($response, 201);
    }

    public function show(Request $request, QuestionnaireResponse $response)
    {
        Gate::authorize('view', $response);

        $response->load('questionnaire.sections.questions');

        $answers = $response->answers()->get()->keyBy('question_id');

        $sections = $response->questionnaire->sections->map(function ($section) use ($answers) {
            $section->questions = $section->questions->map(function ($question) use ($answers) {
                $question->answer = $answers->get($question->id);

                return $question;
            });

            return $section;
        });

        return response()->json([
            'response' => $response,
            'questionnaire' => [
                'id' => $response->questionnaire->id,
                'title' => $response->questionnaire->title,
                'description' => $response->questionnaire->description,
                'price' => $response->questionnaire->price,
                'sections' => $sections,
            ],
            'wallet_plan_credits' => $response->account->walletPlanCreditsSummary(),
        ]);
    }

    public function purchaseCheckout(Request $request, QuestionnaireResponse $response, MercadoPagoClient $mercadoPago)
    {
        Gate::authorize('update', $response);

        abort_if($response->isLocked(), 422, 'Este plano de bolso já foi enviado.');
        abort_if(! $response->questionnaire->price, 422, 'Este questionário não está disponível para compra avulsa.');
        abort_if($response->account->hasWalletPlanCredits(), 422, 'Sua conta ainda tem créditos disponíveis neste ciclo.');
        abort_if($response->purchase_status === 'paid', 422, 'Este plano de bolso já foi pago.');

        $returnPath = $request->user()->isOwner()
            ? '/dono/perguntas/pagamento-retorno/'.$response->id
            : '/questionarios/pagamento-retorno/'.$response->id;

        try {
            $preference = $mercadoPago->createPreference([
                'items' => [[
                    'title' => $response->questionnaire->title,
                    'quantity' => 1,
                    'currency_id' => 'BRL',
                    'unit_price' => (float) $response->questionnaire->price,
                ]],
                'external_reference' => 'response:'.$response->id,
                'back_urls' => [
                    'success' => url($returnPath),
                    'pending' => url($returnPath),
                    'failure' => url($returnPath),
                ],
                'auto_return' => 'approved',
                'notification_url' => url('/api/webhooks/mercadopago'),
            ]);
        } catch (\Throwable $e) {
            report($e);

            abort(502, 'Não foi possível iniciar o pagamento agora. Tente novamente em instantes.');
        }

        $response->update([
            'purchase_status' => 'pending',
            'purchase_amount' => $response->questionnaire->price,
        ]);

        return response()->json(['init_point' => $preference['init_point']]);
    }

    public function finalize(Request $request, QuestionnaireResponse $response, FakeConsultantAi $ai)
    {
        Gate::authorize('update', $response);

        abort_if(
            ! $response->account->hasWalletPlanCredits() && ! $response->isPurchased(),
            422,
            'Sua conta atingiu o limite de envios de planos de bolso deste período. Compre este plano de bolso avulso, aguarde o próximo ciclo ou fale com o suporte.'
        );

        $requiredQuestions = QuestionnaireQuestion::whereHas(
            'section',
            fn ($query) => $query->where('questionnaire_id', $response->questionnaire_id)
        )->where('is_required', true)->get();

        $answers = $response->answers()->whereIn('question_id', $requiredQuestions->pluck('id'))->get()->keyBy('question_id');

        $missing = $requiredQuestions->filter(function ($question) use ($answers) {
            $answer = $answers->get($question->id);

            return ! $answer || $answer->isEmpty();
        })->pluck('id')->values();

        if ($missing->isNotEmpty()) {
            return response()->json(['missing_question_ids' => $missing], 422);
        }

        DB::transaction(function () use ($response, $request, $ai) {
            $response->status = 'finalized';
            $response->finalized_at = now();
            $response->finalized_by = $request->user()->id;
            $response->ai_response = $ai->generateResponse($response);
            $response->save();
        });

        return response()->json([
            'response' => $response,
            'wallet_plan_credits' => $response->account->walletPlanCreditsSummary(),
        ]);
    }
}
