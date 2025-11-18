<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::with(['category', 'translations', 'images']);

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by level
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $courses = $query->orderBy('created_at', 'desc')->get();

        return response()->json($courses);
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
            'duration' => 'required|string',
            'level' => 'required|in:Beginner,Intermediate,Advanced,All Levels',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'max_students' => 'nullable|integer|min:1',
            'requirements' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);

        // Handle requirements (can be JSON string from FormData)
        if ($request->has('requirements')) {
            $requirements = $request->input('requirements');
            if (is_string($requirements)) {
                $decoded = json_decode($requirements, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['requirements'] = $decoded;
                }
            } elseif (is_array($requirements)) {
                $validated['requirements'] = $requirements;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('courses', $filename, 'public');
            $validated['image'] = $path;
        }

        $validated['slug'] = Str::slug($validated['name']);

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $course = Course::with('category')->findOrFail($id);
        return response()->json($course);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'details' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price' => 'sometimes|required|numeric|min:0',
            'duration' => 'sometimes|required|string',
            'level' => 'sometimes|required|in:Beginner,Intermediate,Advanced,All Levels',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'max_students' => 'nullable|integer|min:1',
            'requirements' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans if present
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle requirements (can be JSON string from FormData)
        if ($request->has('requirements')) {
            $requirements = $request->input('requirements');
            if (is_string($requirements)) {
                $decoded = json_decode($requirements, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['requirements'] = $decoded;
                }
            } elseif (is_array($requirements)) {
                $validated['requirements'] = $requirements;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image && Storage::disk('public')->exists($course->image)) {
                Storage::disk('public')->delete($course->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name'] ?? $course->name) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('courses', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $course->update($validated);

        return response()->json($course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // Delete image if exists
        if ($course->image && Storage::disk('public')->exists($course->image)) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
