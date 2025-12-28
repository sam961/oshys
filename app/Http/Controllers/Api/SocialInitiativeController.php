<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialInitiative;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SocialInitiativeController extends Controller
{
    use TranslatableController;

    public function index(Request $request)
    {
        $query = SocialInitiative::with(['category', 'translations']);

        if ($request->has('published')) {
            $isPublished = filter_var($request->published, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_published', $isPublished);
        }

        if ($request->has('featured')) {
            $isFeatured = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_featured', $isFeatured);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $initiatives = $query->orderBy('created_at', 'desc')->get();

        // Add translations to response
        $initiatives = $this->transformWithTranslations($initiatives);

        return response()->json($initiatives);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'is_published' => 'nullable',
            'is_featured' => 'nullable',
            'published_at' => 'nullable|date',
            // Translation fields
            'title_translations' => 'nullable',
            'excerpt_translations' => 'nullable',
            'content_translations' => 'nullable',
        ]);

        $validated['is_published'] = filter_var($request->input('is_published', false), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['title']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('initiatives', $filename, 'public');
            $validated['image'] = $path;
        }

        $validated['slug'] = Str::slug($validated['title']);

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['excerpt_translations'], $validated['content_translations']);

        $initiative = SocialInitiative::create($validated);

        // Save translations
        $this->saveTranslationsFromRequest($initiative, $request);

        return response()->json($initiative->load('translations'), 201);
    }

    public function show($id)
    {
        $initiative = SocialInitiative::with(['category', 'translations'])->findOrFail($id);
        return response()->json($initiative->toArrayWithTranslations());
    }

    public function update(Request $request, $id)
    {
        $initiative = SocialInitiative::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'is_published' => 'nullable',
            'is_featured' => 'nullable',
            'published_at' => 'nullable|date',
            // Translation fields
            'title_translations' => 'nullable',
            'excerpt_translations' => 'nullable',
            'content_translations' => 'nullable',
        ]);

        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            if ($initiative->image && Storage::disk('public')->exists($initiative->image)) {
                Storage::disk('public')->delete($initiative->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['title'] ?? $initiative->title) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('initiatives', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Remove translation fields from validated data
        unset($validated['title_translations'], $validated['excerpt_translations'], $validated['content_translations']);

        $initiative->update($validated);

        // Save translations
        $this->saveTranslationsFromRequest($initiative, $request);

        return response()->json($initiative->load('translations'));
    }

    public function destroy($id)
    {
        $initiative = SocialInitiative::findOrFail($id);

        if ($initiative->image && Storage::disk('public')->exists($initiative->image)) {
            Storage::disk('public')->delete($initiative->image);
        }

        $initiative->delete();

        return response()->json(['message' => 'Initiative deleted successfully']);
    }
}
