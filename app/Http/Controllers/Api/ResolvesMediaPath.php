<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;

/**
 * Shared helper for validating a media-picker image path. Used by controllers
 * that let an admin reuse an existing uploaded image (e.g. blog, initiatives)
 * instead of uploading a new file.
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
}
