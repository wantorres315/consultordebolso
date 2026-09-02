<?php

namespace App\Services;

use App\Models\QuestionnaireResponse;

/**
 * Placeholder stand-in for the real AI analysis described in the product's
 * MVP doc (answers → AI → commercial action plan). Not integrated yet — this
 * just fabricates plausible-sounding filler text so the finalize flow, data
 * model, and UI have something real to display in the meantime. Swap
 * `generateResponse()` for an actual AI call when that integration happens.
 */
class FakeConsultantAi
{
    private const OPENERS = [
        'Analisando as respostas do seu questionário',
        'Com base no que você compartilhou',
        'Depois de examinar suas respostas',
    ];

    private const BODIES = [
        'identificamos uma oportunidade clara de crescimento. O alinhamento entre o público-alvo e a oferta apresentada sugere um potencial de conversão acima da média para o seu segmento.',
        'sua estratégia comercial apresenta fundamentos sólidos. Recomendamos focar os próximos esforços em fortalecer o relacionamento com os clientes já conquistados antes de expandir para novos públicos.',
        'notamos sinergia entre o produto escolhido e a capacidade de entrega informada. Isso é um bom indício de que a meta estabelecida é alcançável dentro do prazo definido.',
        'sua oferta tem potencial, mas vale revisar a condição comercial informada — pequenos ajustes podem melhorar bastante a margem sem perder competitividade.',
    ];

    private const CLOSERS = [
        'Este é um plano de ação preliminar gerado automaticamente — em breve, nossa IA vai analisar suas respostas de verdade e entregar recomendações personalizadas.',
        'Lembre-se: este texto é apenas um simulador enquanto a integração com IA ainda não foi ativada.',
        'Assim que a análise por IA estiver disponível, este espaço será substituído por um plano comercial real e executável.',
    ];

    public function generateResponse(QuestionnaireResponse $response): string
    {
        $opener = self::OPENERS[array_rand(self::OPENERS)];
        $body = self::BODIES[array_rand(self::BODIES)];
        $closer = self::CLOSERS[array_rand(self::CLOSERS)];
        $title = $response->questionnaire->title;

        return "{$opener} para \"{$title}\", {$body}\n\n{$closer}";
    }
}
