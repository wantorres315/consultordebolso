<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MercadoPagoClient
{
    protected function client()
    {
        return Http::withToken(config('services.mercadopago.access_token'))
            ->baseUrl('https://api.mercadopago.com')
            ->acceptJson();
    }

    public function createPreference(array $data): array
    {
        return $this->client()
            ->post('/checkout/preferences', $data)
            ->throw()
            ->json();
    }

    public function findPayment(string $id): array
    {
        return $this->client()
            ->get("/v1/payments/{$id}")
            ->throw()
            ->json();
    }
}
