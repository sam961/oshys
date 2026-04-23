<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin — Corals & Shells Diving</title>
    <meta name="description" content="Corals & Shells Diving admin panel.">
    <meta name="robots" content="noindex, nofollow">

    <link rel="dns-prefetch" href="{{ url('/api') }}">
    @vite(['resources/css/app.css', 'resources/js/admin-main.tsx'])
</head>
<body class="antialiased">
    <div id="app"></div>
</body>
</html>
