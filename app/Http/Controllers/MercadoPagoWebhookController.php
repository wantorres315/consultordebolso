<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Payment;
use App\Models\QuestionnaireResponse;
use App\Services\MercadoPagoClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MercadoPagoWebhookController extends Controller
{
    public function store(Request $request, MercadoPagoClient $mercadoPago)
    {
        $paymentId = $request->query('data.id') ?? $request->input('data.id');

        if (! $paymentId) {
            return response()->noContent();
        }

        try {
            $payment = $mercadoPago->findPayment($paymentId);

            if (($payment['status'] ?? null) === 'approved') {
                $externalReference = (string) ($payment['external_reference'] ?? '');
                $amount = (float) ($payment['transaction_amount'] ?? 0);
                $paidAt = $payment['date_approved'] ?? now();

                if (str_starts_with($externalReference, 'response:')) {
                    $responseId = substr($externalReference, strlen('response:'));
                    $response = QuestionnaireResponse::find($responseId);

                    if ($response) {
                        $response->update(['purchase_status' => 'paid']);

                        Payment::updateOrCreate(
                            ['mercadopago_payment_id' => (string) $paymentId],
                            [
                                'account_id' => $response->account_id,
                                'questionnaire_response_id' => $response->id,
                                'type' => 'questionnaire_purchase',
                                'method' => 'mercadopago',
                                'amount' => $amount ?: $response->purchase_amount,
                                'currency' => 'BRL',
                                'status' => 'approved',
                                'paid_at' => $paidAt,
                            ]
                        );
                    }
                } else {
                    $account = Account::find($externalReference ?: null);

                    if ($account) {
                        $account->update(['subscription_status' => 'active']);

                        Payment::updateOrCreate(
                            ['mercadopago_payment_id' => (string) $paymentId],
                            [
                                'account_id' => $account->id,
                                'type' => 'subscription',
                                'method' => 'mercadopago',
                                'amount' => $amount,
                                'currency' => 'BRL',
                                'status' => 'approved',
                                'paid_at' => $paidAt,
                            ]
                        );
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Mercado Pago webhook processing failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->noContent();
    }
}
