<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CachePublicGet
{
    private const TTL_SECONDS = 300;
    private const CACHE_PREFIX = 'api_public';

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        $key = sprintf(
            '%s:%s:%s?%s',
            self::CACHE_PREFIX,
            app()->getLocale(),
            $request->path(),
            http_build_query($request->query())
        );

        $cached = Cache::get($key);

        if ($cached !== null) {
            return response($cached['body'], $cached['status'])
                ->header('Content-Type', $cached['content_type'])
                ->header('X-Cache', 'HIT');
        }

        /** @var Response $response */
        $response = $next($request);

        if ($response->getStatusCode() === 200) {
            Cache::put($key, [
                'body' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'content_type' => $response->headers->get('Content-Type', 'application/json'),
            ], self::TTL_SECONDS);
        }

        $response->headers->set('X-Cache', 'MISS');

        return $response;
    }
}
