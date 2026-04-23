<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request;
use Throwable;

class CacheWarmCommand extends Command
{
    protected $signature = 'cache:warm';

    protected $description = 'Pre-warm the CachePublicGet middleware cache for both EN and AR locales';

    public function handle(HttpKernel $kernel): int
    {
        $locales = ['en', 'ar'];
        $endpoints = [
            '/api/home-data',
            '/api/settings',
            '/api/banners',
            '/api/courses',
            '/api/trips',
            '/api/events',
            '/api/team-members-featured',
            '/api/social-initiatives',
            '/api/footer-links',
        ];

        $successCount = 0;
        $failureCount = 0;

        foreach ($locales as $locale) {
            foreach ($endpoints as $endpoint) {
                $this->info("Warming {$endpoint} [{$locale}]...");

                try {
                    $request = Request::create($endpoint, 'GET');
                    $request->headers->set('Accept', 'application/json');
                    $request->headers->set('Accept-Language', $locale);

                    $response = $kernel->handle($request);

                    if ($response->getStatusCode() === 200) {
                        $successCount++;
                    } else {
                        $failureCount++;
                        $this->warn("  -> HTTP {$response->getStatusCode()} for {$endpoint} [{$locale}]");
                    }

                    $kernel->terminate($request, $response);
                } catch (Throwable $e) {
                    $failureCount++;
                    $this->warn("  -> Failed {$endpoint} [{$locale}]: {$e->getMessage()}");
                }
            }
        }

        $total = $successCount + $failureCount;

        $this->newLine();
        $this->info("Cache warm complete: {$successCount}/{$total} succeeded, {$failureCount} failed.");

        return self::SUCCESS;
    }
}
