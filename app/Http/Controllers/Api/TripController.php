<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TripController extends Controller
{
    use TranslatableController;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Trip::with(['category', 'images', 'translations']);

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by difficulty
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $trips = $query->orderBy('created_at', 'desc')->get();

        // Add translations to response
        $trips = $this->transformWithTranslations($trips);

        return response()->json($trips);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'details' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'duration' => 'required|string',
            'difficulty' => 'required|in:Easy,Moderate,Challenging,Advanced',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'certification_required' => 'nullable',
            'max_participants' => 'nullable|integer|min:1',
            'number_of_dives' => 'nullable|integer|min:1',
            'included_items' => 'nullable',
            // Translation fields
            'name_translations' => 'nullable',
            'description_translations' => 'nullable',
            'details_translations' => 'nullable',
            'location_translations' => 'nullable',
            'duration_translations' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);
        $validated['certification_required'] = filter_var($request->input('certification_required', false), FILTER_VALIDATE_BOOLEAN);

        // Handle included_items (can be JSON string from FormData)
        if ($request->has('included_items')) {
            $items = $request->input('included_items');
            if (is_string($items)) {
                $decoded = json_decode($items, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['included_items'] = $decoded;
                }
            } elseif (is_array($items)) {
                $validated['included_items'] = $items;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('trips', $filename, 'public');
            $validated['image'] = $path;
        }

        $validated['slug'] = Str::slug($validated['name']);

        // Remove translation fields from validated data
        unset($validated['name_translations'], $validated['description_translations'], $validated['details_translations'], $validated['location_translations'], $validated['duration_translations']);

        $trip = Trip::create($validated);

        // Save translations
        $this->saveTranslationsFromRequest($trip, $request);

        return response()->json($trip->load('translations'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $trip = Trip::with(['category', 'images', 'translations'])->findOrFail($id);
        return response()->json($trip->toArrayWithTranslations());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'details' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price' => 'sometimes|required|numeric|min:0',
            'location' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string',
            'difficulty' => 'sometimes|required|in:Easy,Moderate,Challenging,Advanced',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'certification_required' => 'nullable',
            'max_participants' => 'nullable|integer|min:1',
            'number_of_dives' => 'nullable|integer|min:1',
            'included_items' => 'nullable',
            // Translation fields
            'name_translations' => 'nullable',
            'description_translations' => 'nullable',
            'details_translations' => 'nullable',
            'location_translations' => 'nullable',
            'duration_translations' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans if present
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('certification_required')) {
            $validated['certification_required'] = filter_var($request->input('certification_required'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle included_items (can be JSON string from FormData)
        if ($request->has('included_items')) {
            $items = $request->input('included_items');
            if (is_string($items)) {
                $decoded = json_decode($items, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['included_items'] = $decoded;
                }
            } elseif (is_array($items)) {
                $validated['included_items'] = $items;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($trip->image && Storage::disk('public')->exists($trip->image)) {
                Storage::disk('public')->delete($trip->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name'] ?? $trip->name) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('trips', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Remove translation fields from validated data
        unset($validated['name_translations'], $validated['description_translations'], $validated['details_translations'], $validated['location_translations'], $validated['duration_translations']);

        $trip->update($validated);

        // Save translations
        $this->saveTranslationsFromRequest($trip, $request);

        return response()->json($trip->load('translations'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $trip = Trip::findOrFail($id);

        // Delete image if exists
        if ($trip->image && Storage::disk('public')->exists($trip->image)) {
            Storage::disk('public')->delete($trip->image);
        }

        $trip->delete();

        return response()->json(['message' => 'Trip deleted successfully']);
    }
}
