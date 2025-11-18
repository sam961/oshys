<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = BlogPost::with(['category', 'author', 'images']);

        // Filter by published status
        if ($request->has('published')) {
            $isPublished = filter_var($request->published, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_published', $isPublished);
        }

        // Filter by featured
        if ($request->has('featured')) {
            $isFeatured = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_featured', $isFeatured);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by author
        if ($request->has('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $blogPosts = $query->orderBy('created_at', 'desc')->get();

        return response()->json($blogPosts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'author_id' => 'required|exists:users,id',
            'is_published' => 'nullable',
            'is_featured' => 'nullable',
            'published_at' => 'nullable|date',
        ]);

        // Convert boolean strings to actual booleans
        $validated['is_published'] = filter_var($request->input('is_published', false), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['title']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('blog', $filename, 'public');
            $validated['image'] = $path;
        }

        $validated['slug'] = Str::slug($validated['title']);

        $blogPost = BlogPost::create($validated);

        return response()->json($blogPost, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $blogPost = BlogPost::with(['category', 'author', 'images'])->findOrFail($id);
        return response()->json($blogPost);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $blogPost = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'author_id' => 'sometimes|required|exists:users,id',
            'is_published' => 'nullable',
            'is_featured' => 'nullable',
            'published_at' => 'nullable|date',
        ]);

        // Convert boolean strings to actual booleans if present
        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($blogPost->image && Storage::disk('public')->exists($blogPost->image)) {
                Storage::disk('public')->delete($blogPost->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['title'] ?? $blogPost->title) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('blog', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $blogPost->update($validated);

        return response()->json($blogPost);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $blogPost = BlogPost::findOrFail($id);

        // Delete image if exists
        if ($blogPost->image && Storage::disk('public')->exists($blogPost->image)) {
            Storage::disk('public')->delete($blogPost->image);
        }

        $blogPost->delete();

        return response()->json(['message' => 'Blog post deleted successfully']);
    }
}
