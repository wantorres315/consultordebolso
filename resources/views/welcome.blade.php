<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }}</title>
        <meta name="description" content="{{ config('app.description') }}">
        <meta name="theme-color" content="#FCA311">
        <link rel="canonical" href="{{ url()->current() }}">

        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicon-180.png') }}">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name') }}">
        <meta property="og:title" content="{{ config('app.name') }}">
        <meta property="og:description" content="{{ config('app.description') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ asset('og-image.png') }}">
        <meta property="og:locale" content="{{ app()->getLocale() }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name') }}">
        <meta name="twitter:description" content="{{ config('app.description') }}">
        <meta name="twitter:image" content="{{ asset('og-image.png') }}">

        <script type="application/ld+json">
            {!! json_encode([
                '@@context' => 'https://schema.org',
                '@@type' => 'Organization',
                'name' => config('app.name'),
                'description' => config('app.description'),
                'url' => url('/'),
                'logo' => asset('favicon-180.png'),
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>

        <script>
            (function () {
                var stored = localStorage.getItem('theme');
                var theme = stored === 'light' || stored === 'dark'
                    ? stored
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
            })();
        </script>

        @fonts

        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
