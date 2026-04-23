<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Corals & Shells Diving — CAS Academy</title>
    <meta name="description" content="Corals & Shells Diving — CAS Academy. Structured swimming and diving programs in Al Khobar, Saudi Arabia. Built on safety, progression, and commitment.">

    <!-- PWA -->
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#0891b2">

    <!-- Tajawal (Arabic UI font) still loaded via Google Fonts in app.css — preconnect helps -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body class="antialiased">
    <div id="app"></div>
</body>
</html>
