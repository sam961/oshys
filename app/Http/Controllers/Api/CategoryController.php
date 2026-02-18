<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('name', 'asc')->get();

        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        // Save translations
        if ($request->has('name_translations')) {
            $translations = is_string($request->name_translations) ? json_decode($request->name_translations, true) : $request->name_translations;
            if ($translations) {
                $category->saveTranslations('name', $translations);
            }
        }
        if ($request->has('description_translations')) {
            $translations = is_string($request->description_translations) ? json_decode($request->description_translations, true) : $request->description_translations;
            if ($translations) {
                $category->saveTranslations('description', $translations);
            }
        }

        return response()->json($category->toArrayWithTranslations(), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return response()->json($category->toArrayWithTranslations());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|string|max:255',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        // Save translations
        if ($request->has('name_translations')) {
            $translations = is_string($request->name_translations) ? json_decode($request->name_translations, true) : $request->name_translations;
            if ($translations) {
                $category->saveTranslations('name', $translations);
            }
        }
        if ($request->has('description_translations')) {
            $translations = is_string($request->description_translations) ? json_decode($request->description_translations, true) : $request->description_translations;
            if ($translations) {
                $category->saveTranslations('description', $translations);
            }
        }

        return response()->json($category->toArrayWithTranslations());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
