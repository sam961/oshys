<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use TranslatableController;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::with(['images', 'translations']);

        // Filter by active status
        if ($request->has('active')) {
            $isActive = filter_var($request->active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by upcoming events
        if ($request->has('upcoming') && $request->upcoming) {
            $query->where('start_date', '>=', now());
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $events = $query->orderBy('start_date', 'asc')->get();

        // Add translations to response
        $events = $this->transformWithTranslations($events);

        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            // Translation fields
            'title_translations' => 'nullable',
            'description_translations' => 'nullable',
            'location_translations' => 'nullable',
        ]);

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['description_translations'], $validated['location_translations']);

        $event = Event::create($validated);

        // Save translations
        $this->saveTranslationsFromRequest($event, $request);

        return response()->json($event->load('translations'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $event = Event::with(['images', 'translations'])->findOrFail($id);
        return response()->json($event->toArrayWithTranslations());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'max_participants' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            // Translation fields
            'title_translations' => 'nullable',
            'description_translations' => 'nullable',
            'location_translations' => 'nullable',
        ]);

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['description_translations'], $validated['location_translations']);

        $event->update($validated);

        // Save translations
        $this->saveTranslationsFromRequest($event, $request);

        return response()->json($event->load('translations'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
