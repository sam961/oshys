<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\Course;
use App\Models\Image;
use App\Models\Product;
use App\Models\SocialInitiative;
use App\Models\TeamMember;
use App\Models\Trip;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupMediaCommand extends Command
{
    protected $signature = 'media:cleanup {--dry-run : List orphaned files without deleting}';

    protected $description = 'Delete uploaded images that are no longer referenced by any record';

    /** Directories scanned for uploaded images. */
    private const DIRECTORIES = [
        'blog', 'initiatives', 'courses', 'courses/gallery',
        'trips', 'trips/gallery', 'banners', 'team', 'events', 'products',
    ];

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $disk = Storage::disk('public');

        $referenced = $this->referencedPaths();
        $this->info(count($referenced) . ' referenced image(s) found.');

        $orphans = [];
        foreach (self::DIRECTORIES as $dir) {
            if (! $disk->exists($dir)) {
                continue;
            }
            foreach ($disk->files($dir) as $path) {
                if (! isset($referenced[$path])) {
                    $orphans[] = $path;
                }
            }
        }

        if (empty($orphans)) {
            $this->info('No orphaned images. Nothing to clean up.');

            return self::SUCCESS;
        }

        $this->warn(count($orphans) . ' orphaned image(s):');
        foreach ($orphans as $path) {
            $this->line('  ' . $path);
        }

        if ($dryRun) {
            $this->info('Dry run — nothing deleted. Re-run without --dry-run to delete.');

            return self::SUCCESS;
        }

        if (! $this->confirm('Delete these ' . count($orphans) . ' file(s)?', true)) {
            $this->info('Aborted.');

            return self::SUCCESS;
        }

        $disk->delete($orphans);
        $this->info('Deleted ' . count($orphans) . ' orphaned image(s).');

        return self::SUCCESS;
    }

    /**
     * Every image path currently referenced by a record, as a lookup map
     * (path => true) for O(1) membership checks.
     */
    private function referencedPaths(): array
    {
        $paths = [];

        // Single-image models (the `image` column).
        foreach ([BlogPost::class, Course::class, Trip::class, Product::class, Banner::class, SocialInitiative::class, TeamMember::class] as $model) {
            foreach ($model::whereNotNull('image')->pluck('image') as $path) {
                $paths[$path] = true;
            }
        }

        // Gallery images (the polymorphic Image model's `path` column).
        foreach (Image::whereNotNull('path')->pluck('path') as $path) {
            $paths[$path] = true;
        }

        return $paths;
    }
}
