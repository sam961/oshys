<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Supported locales
        $supportedLocales = ['en', 'ar'];
        $defaultLocale = config('app.locale', 'en');

        // Get locale from:
        // 1. Accept-Language header (from frontend)
        // 2. Query parameter (?lang=ar)
        // 3. Default locale
        $locale = $request->header('Accept-Language')
            ?? $request->query('lang')
            ?? $defaultLocale;

        // Extract base language code (e.g. "ar-SA" → "ar")
        $locale = strtolower(substr($locale, 0, 2));

        // Validate locale
        if (!in_array($locale, $supportedLocales)) {
            $locale = $defaultLocale;
        }

        // Set application locale
        app()->setLocale($locale);

        return $next($request);
    }
}
