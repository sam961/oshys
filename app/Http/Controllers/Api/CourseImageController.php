<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CourseImageController extends Controller
{
    /**
     * Upload images for a course.
     */
    public function store(Request $request, Course $course)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $maxOrder = $course->images()->max('order') ?? -1;
        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $maxOrder++;
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('courses/gallery', $filename, 'public');

            $image = $course->images()->create([
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'url' => '/storage/' . $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'collection' => 'gallery',
                'order' => $maxOrder,
            ]);

            $uploaded[] = $image;
        }

        // If this course has no main image, set the first uploaded as main
        if (!$course->image && count($uploaded) > 0) {
            $firstImage = $uploaded[0];
            $firstImage->update(['collection' => 'main']);
            $course->update(['image' => $firstImage->path]);
        }

        return response()->json($course->images()->orderBy('order')->get(), 201);
    }

    /**
     * Delete a course image.
     */
    public function destroy(Course $course, Image $image)
    {
        // Verify image belongs to this course
        if ($image->imageable_id !== $course->id || $image->imageable_type !== Course::class) {
            return response()->json(['message' => 'Image not found for this course'], 404);
        }

        $wasMain = $image->collection === 'main';
        $deletedPath = $image->path;

        // Delete file from storage
        if (Storage::disk('public')->exists($deletedPath)) {
            Storage::disk('public')->delete($deletedPath);
        }

        $image->delete();

        // If deleted image was main, promote next image or clear
        if ($wasMain) {
            $nextImage = $course->images()->orderBy('order')->first();
            if ($nextImage) {
                $nextImage->update(['collection' => 'main']);
                $course->update(['image' => $nextImage->path]);
            } else {
                $course->update(['image' => null]);
            }
        }

        return response()->json($course->images()->orderBy('order')->get());
    }

    /**
     * Set an image as the main course image.
     */
    public function setMain(Course $course, Image $image)
    {
        // Verify image belongs to this course
        if ($image->imageable_id !== $course->id || $image->imageable_type !== Course::class) {
            return response()->json(['message' => 'Image not found for this course'], 404);
        }

        // Set all images to gallery
        $course->images()->update(['collection' => 'gallery']);

        // Set selected as main
        $image->update(['collection' => 'main']);

        // Clean up old standalone main image if it's not tracked in the images table
        $oldMainPath = $course->image;
        if ($oldMainPath && $oldMainPath !== $image->path) {
            $imagePathsInTable = $course->images()->pluck('path')->toArray();
            if (!in_array($oldMainPath, $imagePathsInTable) && Storage::disk('public')->exists($oldMainPath)) {
                Storage::disk('public')->delete($oldMainPath);
            }
        }

        // Update course main image field
        $course->update(['image' => $image->path]);

        return response()->json($course->images()->orderBy('order')->get());
    }

    /**
     * Reorder course images.
     */
    public function reorder(Request $request, Course $course)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|integer',
            'order.*.order' => 'required|integer|min:0',
        ]);

        // Only update images that actually belong to this course
        $courseImageIds = $course->images()->pluck('id')->toArray();

        foreach ($request->input('order') as $item) {
            if (in_array($item['id'], $courseImageIds)) {
                $course->images()->where('id', $item['id'])->update(['order' => $item['order']]);
            }
        }

        return response()->json($course->images()->orderBy('order')->get());
    }
}
