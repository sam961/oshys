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

        $encoding = $this->negotiateEncoding($request);
        $key = $this->cacheKey($request, $encoding);

        $cached = Cache::get($key);

        if ($cached !== null) {
            return $this->buildResponse($cached, $encoding, 'HIT');
        }

        /** @var Response $response */
        $response = $next($request);

        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        $body = $response->getContent();
        $contentType = $response->headers->get('Content-Type', 'application/json');

        $payload = [
            'body' => $body,
            'status' => 200,
            'content_type' => $contentType,
            'compressed_body' => null,
            'compression' => null,
        ];

        if ($encoding !== null && strlen($body) >= self::MIN_COMPRESS_BYTES) {
            $compressed = $this->compress($body, $encoding);
            if ($compressed !== null) {
                $payload['compressed_body'] = $compressed;
                $payload['compression'] = $encoding;
            }
        }

        Cache::put($key, $payload, self::TTL_SECONDS);

        return $this->buildResponse($payload, $encoding, 'MISS');
    }

    private function cacheKey(Request $request, ?string $encoding): string
    {
        return sprintf(
            '%s:%s:%s:%s?%s',
            self::CACHE_PREFIX,
            app()->getLocale(),
            $encoding ?? 'identity',
            $request->path(),
            http_build_query($request->query())
        );
    }

    private function negotiateEncoding(Request $request): ?string
    {
        $accept = strtolower((string) $request->header('Accept-Encoding', ''));

        if (str_contains($accept, 'br') && function_exists('brotli_compress')) {
            return 'br';
        }

        if (str_contains($accept, 'gzip') && function_exists('gzencode')) {
            return 'gzip';
        }

        return null;
    }

    private function compress(string $body, string $encoding): ?string
    {
        if ($encoding === 'br' && function_exists('brotli_compress')) {
            $result = @brotli_compress($body, 5);
            return $result === false ? null : $result;
        }

        if ($encoding === 'gzip' && function_exists('gzencode')) {
            $result = @gzencode($body, 6);
            return $result === false ? null : $result;
        }

        return null;
    }

    private function buildResponse(array $payload, ?string $encoding, string $cacheStatus): Response
    {
        $useCompressed = $payload['compression'] !== null
            && $payload['compression'] === $encoding
            && $payload['compressed_body'] !== null;

        $body = $useCompressed ? $payload['compressed_body'] : $payload['body'];

        $response = response($body, $payload['status'])
            ->header('Content-Type', $payload['content_type'])
            ->header('X-Cache', $cacheStatus)
            ->header('Vary', 'Accept-Encoding');

        if ($useCompressed) {
            $response->header('Content-Encoding', $payload['compression']);
        }

        return $response;
    }
}
