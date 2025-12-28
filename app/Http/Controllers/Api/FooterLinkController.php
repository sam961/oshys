<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FooterLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FooterLinkController extends Controller
{
    use TranslatableController;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FooterLink::with('translations');

        // Filter by active status
        if ($request->has('active')) {
            $isActive = filter_var($request->active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $footerLinks = $query->orderBy('display_order', 'asc')
                             ->orderBy('created_at', 'desc')
                             ->get();

        // Add translations to response
        $footerLinks = $this->transformWithTranslations($footerLinks);

        return response()->json($footerLinks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:footer_links,slug',
            'content' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable',
            'open_in_new_tab' => 'nullable',
            // Translation fields
            'title_translations' => 'nullable',
            'content_translations' => 'nullable',
        ]);

        // Generate slug from title if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Auto-generate URL based on slug
        $validated['url'] = '/pages/' . $validated['slug'];

        // Convert boolean strings to actual booleans
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $validated['open_in_new_tab'] = filter_var($request->input('open_in_new_tab', false), FILTER_VALIDATE_BOOLEAN);

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['content_translations']);

        $footerLink = FooterLink::create($validated);

        // Save translations
        $this->saveTranslationsFromRequest($footerLink, $request);

        return response()->json($footerLink->load('translations'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Try to find by ID first, then by slug
        $footerLink = is_numeric($id)
            ? FooterLink::with('translations')->findOrFail($id)
            : FooterLink::with('translations')->where('slug', $id)->where('is_active', true)->firstOrFail();

        return response()->json($footerLink->toArrayWithTranslations());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $footerLink = FooterLink::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:footer_links,slug,' . $id,
            'content' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable',
            'open_in_new_tab' => 'nullable',
            // Translation fields
            'title_translations' => 'nullable',
            'content_translations' => 'nullable',
        ]);

        // Generate slug from title if title changed
        if (isset($validated['title']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Update URL based on slug
        if (isset($validated['slug'])) {
            $validated['url'] = '/pages/' . $validated['slug'];
        }

        // Convert boolean strings to actual booleans if present
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('open_in_new_tab')) {
            $validated['open_in_new_tab'] = filter_var($request->input('open_in_new_tab'), FILTER_VALIDATE_BOOLEAN);
        }

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['content_translations']);

        $footerLink->update($validated);

        // Save translations
        $this->saveTranslationsFromRequest($footerLink, $request);

        return response()->json($footerLink->load('translations'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $footerLink = FooterLink::findOrFail($id);
        $footerLink->delete();

        return response()->json(['message' => 'Footer link deleted successfully']);
    }
}
