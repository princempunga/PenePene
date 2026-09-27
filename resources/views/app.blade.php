<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'PenePene') }}</title>

        <!-- Default SEO meta tags — fallbacks for pages without a specific <Head> -->
        <meta name="description" content="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC. Découvrez des produits uniques et locaux.">
        <meta name="keywords" content="PenePene, marketplace, e-commerce, RDC, artisans, vendeurs, acheteurs, produits locaux, Kinshasa">
        <meta name="author" content="PenePene">

        <!-- Open Graph -->
        <meta property="og:title" content="PenePene">
        <meta property="og:description" content="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC.">
        <meta property="og:image" content="{{ config('app.url', 'https://penepene.store') }}/images/og-image-default.jpg">
        <meta property="og:url" content="{{ config('app.url', 'https://penepene.store') }}">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="fr_FR">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="PenePene">
        <meta name="twitter:description" content="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC.">
        <meta name="twitter:image" content="{{ config('app.url', 'https://penepene.store') }}/images/og-image-default.jpg">

        <!-- Canonical -->
        <link rel="canonical" href="{{ config('app.url', 'https://penepene.store') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- App Icon / Favicons -->
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/css/app.css', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased min-h-screen bg-gray-50 text-gray-900">
        @inertia
    </body>
</html>
