<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use TranslatableController;
    use ResolvesMediaPath;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::with(['images', 'translations', 'upcomingOccurrences']);

        // Filter by active status
        if ($request->has('active')) {
            $isActive = filter_var($request->active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by upcoming events.
        //
        // Read from the schedule rather than the legacy column: a repeating
        // event is upcoming while any of its dates is still ahead, and
        // cancelled dates must not keep it alive. The legacy fallback covers
        // an event that somehow has no occurrences at all, so nothing
        // disappears from the site.
        if ($request->has('upcoming') && $request->upcoming) {
            $query->where(function ($q) {
                $q->whereHas('occurrences', fn ($o) => $o->scheduled()->upcoming())
                  ->orWhere(fn ($legacy) => $legacy
                      ->whereDoesntHave('occurrences')
                      ->where('start_date', '>=', now()));
            });
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

        $validated['slug'] = $this->uniqueSlug(Event::class, $validated['title']);

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
        $event = $this->resolveEvent($id, ['images', 'translations', 'upcomingOccurrences']);

        return response()->json($event->toArrayWithTranslations());
    }

    /**
     * Find an event by slug or by numeric id.
     *
     * Both are supported on purpose. Slugs are the address the site links to
     * now, but ids were the only address until this change, so anything already
     * shared, bookmarked or indexed still resolves instead of 404ing.
     *
     * A purely numeric slug would be ambiguous, so ids are only tried when the
     * value is numeric AND no event owns it as a slug.
     */
    private function resolveEvent($idOrSlug, array $with = []): Event
    {
        $query = Event::with($with);

        $bySlug = (clone $query)->where('slug', $idOrSlug)->first();
        if ($bySlug) {
            return $bySlug;
        }

        // Only fall back to an id for a numeric value. Passing a slug to
        // findOrFail would have MySQL cast it to 0 and potentially match the
        // wrong row rather than simply missing.
        if (! is_numeric($idOrSlug)) {
            abort(404);
        }

        return $query->findOrFail($idOrSlug);
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

        // Keep the address in step with a renamed event, and give one to an
        // event that predates slugs. An unchanged title leaves the slug alone,
        // so saving an event does not quietly move its page.
        if (isset($validated['title']) && ($validated['title'] !== $event->title || ! $event->slug)) {
            $validated['slug'] = $this->uniqueSlug(Event::class, $validated['title'], $event->id);
        }

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
