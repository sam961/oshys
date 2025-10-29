<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Banner::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->active);
        }

        // Filter by position
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        // Filter by date range (only show banners within their date range)
        if ($request->has('current')) {
            $now = now();
            $query->where(function($q) use ($now) {
                $q->where(function($sq) use ($now) {
                    $sq->whereNull('start_date')
                       ->orWhere('start_date', '<=', $now);
                })
                ->where(function($sq) use ($now) {
                    $sq->whereNull('end_date')
                       ->orWhere('end_date', '>=', $now);
                });
            });
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $banners = $query->orderBy('display_order', 'asc')
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json($banners);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|string',
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'position' => 'required|in:hero,secondary,promo',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $banner = Banner::create($validated);

        return response()->json($banner, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        return response()->json($banner);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'sometimes|required|string',
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'position' => 'sometimes|required|in:hero,secondary,promo',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $banner->update($validated);

        return response()->json($banner);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
