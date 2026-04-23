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
    private const MIN_COMPRESS_BYTES = 1024;

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
        $cacheStatus = 'MISS';

        if ($cached !== null) {
            $cacheStatus = 'HIT';
        } else {
            /** @var Response $response */
            $response = $next($request);

            if ($response->getStatusCode() !== 200) {
                return $response;
            }

            $cached = [
                'body' => $response->getContent(),
                'content_type' => $response->headers->get('Content-Type', 'application/json'),
            ];

            Cache::put($key, $cached, self::TTL_SECONDS);
        }

        return $this->buildResponse($cached, $request, $cacheStatus);
    }

    private function buildResponse(array $cached, Request $request, string $cacheStatus): Response
    {
        $body = $cached['body'];
        $contentType = $cached['content_type'];
        $encoding = null;
        $contentLength = strlen($body);

        if ($contentLength >= self::MIN_COMPRESS_BYTES) {
            $accept = strtolower((string) $request->header('Accept-Encoding', ''));
            if (str_contains($accept, 'br') && function_exists('brotli_compress')) {
                $compressed = @brotli_compress($body, 5);
                if ($compressed !== false) {
                    $body = $compressed;
                    $encoding = 'br';
                }
            }
            if ($encoding === null && str_contains($accept, 'gzip') && function_exists('gzencode')) {
                $compressed = @gzencode($body, 6);
                if ($compressed !== false) {
                    $body = $compressed;
                    $encoding = 'gzip';
                }
            }
        }

        $response = response($body, 200)
            ->header('Content-Type', $contentType)
            ->header('X-Cache', $cacheStatus)
            ->header('Vary', 'Accept-Encoding, Accept-Language')
            // Browser may re-use this response without hitting the server for 60s,
            // then revalidates in the background (stale-while-revalidate). This
            // is the single biggest TTFB win on shared hosting — repeat requests
            // never touch PHP.
            ->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

        if ($encoding !== null) {
            $response->header('Content-Encoding', $encoding);
            $response->header('Content-Length', (string) strlen($body));
        }

        return $response;
    }
}
