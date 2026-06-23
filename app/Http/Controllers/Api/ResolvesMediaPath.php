<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shared helpers for controllers that manage uploaded images and slugged
 * content (e.g. blog, initiatives).
 */
trait ResolvesMediaPath
{
    /**
     * Return the given path only if it points to an existing file on the public
     * disk. Guards against path traversal / arbitrary values being written into
     * the image column.
     */
    private function resolveMediaPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        // Reject traversal and absolute paths; only allow disk-relative paths.
        if (str_contains($path, '..') || str_starts_with($path, '/')) {
            return null;
        }

        return Storage::disk('public')->exists($path) ? $path : null;
    }

    /**
     * Build a slug from the title that is unique within the model's table.
     * Appends -2, -3, ... on collision. Pass $ignoreId to exclude the record
     * being updated so re-saving the same post keeps its slug.
     *
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private function uniqueSlug(string $modelClass, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'item';
        $slug = $base;
        $suffix = 2;

        while (
            $modelClass::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $suffix++;
        }

        return $slug;
    }
}
