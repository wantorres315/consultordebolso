<?php

namespace App\Http\Controllers;

use App\Models\HomeSection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class SeoController extends Controller
{
    public function index(): Response
    {
        $lastHomeUpdate = HomeSection::max('updated_at');
        $lastmod = $lastHomeUpdate ? Carbon::parse($lastHomeUpdate)->toAtomString() : now()->toAtomString();

        $urls = [
            ['loc' => url('/'), 'changefreq' => 'weekly', 'priority' => '1.0', 'lastmod' => $lastmod],
            ['loc' => url('/planos'), 'changefreq' => 'weekly', 'priority' => '0.8', 'lastmod' => $lastmod],
        ];

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /dono',
            'Disallow: /questionarios',
            'Disallow: /api',
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ];

        return response(implode("\n", $lines)."\n", 200)->header('Content-Type', 'text/plain');
    }
}
