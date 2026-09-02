<?php

namespace App\Http\Controllers;

use App\Services\MercadoPagoClient;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function store(Request $request, MercadoPagoClient $mercadoPago)
    {
        $account = $request->user()->account?->load('plan');

        abort_if(! $account || ! $account->plan, 404);
        abort_if($account->subscription_status === 'active', 422, 'Esta conta já está ativa.');

        $price = $account->billing_period === 'annual'
            ? $account->plan->annual_price
            : $account->plan->monthly_price;

        $preference = $mercadoPago->createPreference([
            'items' => [[
                'title' => $account->plan->name,
                'quantity' => 1,
                'currency_id' => 'BRL',
                'unit_price' => (float) $price,
            ]],
            'external_reference' => (string) $account->id,
            'back_urls' => [
                'success' => url('/pagamento/retorno'),
                'pending' => url('/pagamento/retorno'),
                'failure' => url('/pagamento/retorno'),
            ],
            'auto_return' => 'approved',
            'notification_url' => url('/api/webhooks/mercadopago'),
        ]);

        return response()->json(['init_point' => $preference['init_point']]);
    }
}
