<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class CacheWarmCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pre-warm the CachePublicGet middleware cache for both EN and AR locales';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $baseUrl = rtrim(config('app.url'), '/');
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

                $url = $baseUrl . $endpoint;

                try {
                    $response = Http::withHeaders([
                        'Accept-Language' => $locale,
                        'Accept' => 'application/json',
                    ])->timeout(30)->get($url);

                    if ($response->successful()) {
                        $successCount++;
                    } else {
                        $failureCount++;
                        $this->warn("  -> HTTP {$response->status()} for {$endpoint} [{$locale}]");
                    }
                } catch (Throwable $e) {
                    $failureCount++;
                    $this->warn("  -> Request failed for {$endpoint} [{$locale}]: {$e->getMessage()}");
                }
            }
        }

        $total = $successCount + $failureCount;

        $this->newLine();
        $this->info("Cache warm complete: {$successCount}/{$total} succeeded, {$failureCount} failed.");

        return self::SUCCESS;
    }
}
