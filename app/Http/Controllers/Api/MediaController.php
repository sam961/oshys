<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Directories on the public disk that hold user-uploaded images.
     * The media picker lists images already uploaded across the site so an
     * admin can reuse one (e.g. as a blog featured image) without re-uploading.
     */
    private const DIRECTORIES = ['blog', 'initiatives', 'courses', 'trips', 'banners', 'team', 'events', 'products'];

    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * List all previously-uploaded images, newest first.
     */
    public function index()
    {
        $disk = Storage::disk('public');
        $images = [];

        foreach (self::DIRECTORIES as $dir) {
            try {
                if (! $disk->exists($dir)) {
                    continue;
                }

                foreach ($disk->files($dir) as $path) {
                    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                    if (! in_array($ext, self::IMAGE_EXTENSIONS, true)) {
                        continue;
                    }

                    // lastModified can throw if a file vanishes mid-scan; default to 0.
                    try {
                        $lastModified = $disk->lastModified($path);
                    } catch (\Throwable $e) {
                        $lastModified = 0;
                    }

                    $images[] = [
                        // Relative path stored on models (e.g. "blog/123_title.jpg").
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'name' => basename($path),
                        'folder' => $dir,
                        'last_modified' => $lastModified,
                    ];
                }
            } catch (\Throwable $e) {
                // A single unreadable directory must not break the whole listing.
                continue;
            }
        }

        // Newest first so recent uploads surface at the top of the picker.
        usort($images, fn ($a, $b) => $b['last_modified'] <=> $a['last_modified']);

        return response()->json(['data' => $images]);
    }
}
