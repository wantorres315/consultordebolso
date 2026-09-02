<?php

namespace App\Http\Controllers;

use App\Models\Questionnaire;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    public function index(Request $request)
    {
        $account = $request->user()->account;

        abort_if(! $account, 404);

        $questionnaires = Questionnaire::query()
            ->where('is_active', true)
            ->orWhereHas('responses', fn ($query) => $query->where('account_id', $account->id))
            ->withCount([
                'responses as finalized_count' => fn ($query) => $query
                    ->where('account_id', $account->id)
                    ->where('status', 'finalized'),
            ])
            ->get()
            ->map(function (Questionnaire $questionnaire) use ($account) {
                $draft = $questionnaire->responses()
                    ->where('account_id', $account->id)
                    ->where('status', 'draft')
                    ->first();

                $questionnaire->draft_response_id = $draft?->id;

                return $questionnaire;
            });

        return response()->json([
            'questionnaires' => $questionnaires,
            'wallet_plan_credits' => $account->walletPlanCreditsSummary(),
        ]);
    }
}
