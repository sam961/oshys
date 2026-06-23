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
     * Delete an image file from the public disk, but only if no other record
     * still references it. Images can be shared (the media picker lets posts
     * reuse an existing image), so blindly deleting on post-delete would orphan
     * files or break another post still using the same image.
     *
     * Call this AFTER the owning record is deleted. Only live (non-trashed)
     * records count as references — a soft-deleted post is no longer shown
     * anywhere, so its image can be reclaimed. The deleted record is therefore
     * naturally excluded.
     */
    private function deleteImageIfUnused(?string $path): void
    {
        if (! $path) {
            return;
        }

        // Models that store a single image path in an `image` column.
        $models = [
            \App\Models\BlogPost::class,
            \App\Models\SocialInitiative::class,
            \App\Models\Course::class,
            \App\Models\Trip::class,
            \App\Models\Product::class,
            \App\Models\Banner::class,
            \App\Models\TeamMember::class,
        ];

        foreach ($models as $model) {
            // Default scope excludes soft-deleted rows — exactly what we want:
            // only a live record using this image should block deletion.
            if ($model::where('image', $path)->exists()) {
                return;
            }
        }

        // Gallery images (polymorphic Image model) may also reference it.
        if (\App\Models\Image::where('path', $path)->exists()) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
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
