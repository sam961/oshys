<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TripImageController extends Controller
{
    /**
     * Upload images for a trip.
     */
    public function store(Request $request, Trip $trip)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $maxOrder = $trip->images()->max('order') ?? -1;
        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $maxOrder++;
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('trips/gallery', $filename, 'public');

            $image = $trip->images()->create([
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

        // If this trip has no main image, set the first uploaded as main
        if (!$trip->image && count($uploaded) > 0) {
            $firstImage = $uploaded[0];
            $firstImage->update(['collection' => 'main']);
            $trip->update(['image' => $firstImage->path]);
        }

        return response()->json($trip->images()->orderBy('order')->get(), 201);
    }

    /**
     * Delete a trip image.
     */
    public function destroy(Trip $trip, Image $image)
    {
        if ($image->imageable_id !== $trip->id || $image->imageable_type !== Trip::class) {
            return response()->json(['message' => 'Image not found for this trip'], 404);
        }

        $wasMain = $image->collection === 'main';
        $deletedPath = $image->path;

        if (Storage::disk('public')->exists($deletedPath)) {
            Storage::disk('public')->delete($deletedPath);
        }

        $image->delete();

        if ($wasMain) {
            $nextImage = $trip->images()->orderBy('order')->first();
            if ($nextImage) {
                $nextImage->update(['collection' => 'main']);
                $trip->update(['image' => $nextImage->path]);
            } else {
                $trip->update(['image' => null]);
            }
        }

        return response()->json($trip->images()->orderBy('order')->get());
    }

    /**
     * Set an image as the main trip image.
     */
    public function setMain(Trip $trip, Image $image)
    {
        if ($image->imageable_id !== $trip->id || $image->imageable_type !== Trip::class) {
            return response()->json(['message' => 'Image not found for this trip'], 404);
        }

        $trip->images()->update(['collection' => 'gallery']);
        $image->update(['collection' => 'main']);

        // Clean up old standalone main image
        $oldMainPath = $trip->image;
        if ($oldMainPath && $oldMainPath !== $image->path) {
            $imagePathsInTable = $trip->images()->pluck('path')->toArray();
            if (!in_array($oldMainPath, $imagePathsInTable) && Storage::disk('public')->exists($oldMainPath)) {
                Storage::disk('public')->delete($oldMainPath);
            }
        }

        $trip->update(['image' => $image->path]);

        return response()->json($trip->images()->orderBy('order')->get());
    }

    /**
     * Reorder trip images.
     */
    public function reorder(Request $request, Trip $trip)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|integer',
            'order.*.order' => 'required|integer|min:0',
        ]);

        $tripImageIds = $trip->images()->pluck('id')->toArray();

        foreach ($request->input('order') as $item) {
            if (in_array($item['id'], $tripImageIds)) {
                $trip->images()->where('id', $item['id'])->update(['order' => $item['order']]);
            }
        }

        return response()->json($trip->images()->orderBy('order')->get());
    }
}
