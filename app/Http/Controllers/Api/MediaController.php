<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Directories on the public disk that hold user-uploaded images.
     * The media picker lists images already uploaded across the site so an
     * admin can reuse one (e.g. as a blog featured image) without re-uploading.
     *
     * 'editor' holds images inserted inline in a rich-text body. They are
     * listed here too so an inline image can be reused elsewhere.
     */
    private const DIRECTORIES = ['blog', 'initiatives', 'courses', 'trips', 'banners', 'team', 'events', 'products', 'editor'];

    /** Where images uploaded from inside the rich-text editor are stored. */
    private const EDITOR_DIRECTORY = 'editor';

    /**
     * Max upload size for an inline editor image, in kilobytes. Higher than the
     * 2MB used for featured images because article bodies are typically filled
     * with straight-off-the-phone photos.
     */
    private const MAX_UPLOAD_KB = 4096;

    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * List all previously-uploaded images, newest first.
     */
    public function index()
    {
        $disk = Storage::disk('public');
        $images = [];

        // Track content fingerprints so the same image re-uploaded under
        // different timestamped names appears only once in the picker.
        $seenHashes = [];

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

                    // Fingerprint by size + content checksum; skip exact duplicates.
                    try {
                        $hash = $disk->size($path) . ':' . md5($disk->get($path));
                        if (isset($seenHashes[$hash])) {
                            continue;
                        }
                        $seenHashes[$hash] = true;
                    } catch (\Throwable $e) {
                        // If a file can't be read, fall back to listing it by path.
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

    /**
     * Store an image uploaded from inside the rich-text editor and return its
     * public URL, so the editor can insert it at the cursor.
     *
     * Unlike the per-resource uploads (a blog post's featured image, a course
     * gallery), this is not tied to any record: the resulting <img src> lives
     * in the content HTML. The file is therefore never reclaimed by
     * deleteImageIfUnused(), which only tracks images referenced by an `image`
     * column — deleting a post leaves its inline images on disk.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:' . self::MAX_UPLOAD_KB,
        ]);

        $file = $request->file('image');

        // Name from the original file so the media picker stays browsable,
        // prefixed with a timestamp + random suffix to avoid collisions and to
        // keep a user-supplied name out of the path.
        $base = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'image';
        $filename = time() . '_' . Str::random(6) . '_' . $base . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs(self::EDITOR_DIRECTORY, $filename, 'public');

        return response()->json([
            'path' => $path,
            'url' => asset('storage/' . $path),
            'name' => $filename,
        ], 201);
    }
}
