<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TripController extends Controller
{
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
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'duration' => 'required|string',
            'difficulty' => 'required|in:Easy,Moderate,Challenging,Advanced',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'certification_required' => 'boolean',
            'max_participants' => 'nullable|integer|min:1',
            'included_items' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $trip = Trip::create($validated);

        return response()->json($trip, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $trip = Trip::with(['category', 'images'])->findOrFail($id);
        return response()->json($trip);
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
            'image' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'location' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string',
            'difficulty' => 'sometimes|required|in:Easy,Moderate,Challenging,Advanced',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'certification_required' => 'boolean',
            'max_participants' => 'nullable|integer|min:1',
            'included_items' => 'nullable|array',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $trip->update($validated);

        return response()->json($trip);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $trip = Trip::findOrFail($id);
        $trip->delete();

        return response()->json(['message' => 'Trip deleted successfully']);
    }
}
