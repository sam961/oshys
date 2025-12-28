<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TeamMemberController extends Controller
{
    /**
     * Get the featured instructor based on CMS settings.
     */
    public function featured()
    {
        $featuredId = Setting::get('featured_instructor_id');

        if (!$featuredId) {
            // Fallback to first active team member if no featured instructor is set
            $teamMember = TeamMember::with('images')
                ->where('is_active', true)
                ->orderBy('display_order', 'asc')
                ->first();
        } else {
            $teamMember = TeamMember::with('images')
                ->where('id', $featuredId)
                ->where('is_active', true)
                ->first();
        }

        if (!$teamMember) {
            return response()->json(null);
        }

        return response()->json($teamMember);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TeamMember::with('images');

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teamMembers = $query->orderBy('display_order', 'asc')
                             ->orderBy('created_at', 'desc')
                             ->get();

        return response()->json($teamMembers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'certifications' => 'nullable',
            'social_links' => 'nullable',
            'is_active' => 'nullable',
            'display_order' => 'nullable|integer|min:0',
        ]);

        // Convert boolean strings to actual booleans
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        // Handle certifications (can be JSON string from FormData)
        if ($request->has('certifications')) {
            $certifications = $request->input('certifications');
            if (is_string($certifications)) {
                $decoded = json_decode($certifications, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['certifications'] = $decoded;
                }
            } elseif (is_array($certifications)) {
                $validated['certifications'] = $certifications;
            }
        }

        // Handle social_links (can be JSON string from FormData)
        if ($request->has('social_links')) {
            $socialLinks = $request->input('social_links');
            if (is_string($socialLinks)) {
                $decoded = json_decode($socialLinks, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['social_links'] = $decoded;
                }
            } elseif (is_array($socialLinks)) {
                $validated['social_links'] = $socialLinks;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('team', $filename, 'public');
            $validated['image'] = $path;
        }

        $teamMember = TeamMember::create($validated);

        return response()->json($teamMember, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $teamMember = TeamMember::with('images')->findOrFail($id);
        return response()->json($teamMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $teamMember = TeamMember::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'certifications' => 'nullable',
            'social_links' => 'nullable',
            'is_active' => 'nullable',
            'display_order' => 'nullable|integer|min:0',
        ]);

        // Convert boolean strings to actual booleans if present
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle certifications (can be JSON string from FormData)
        if ($request->has('certifications')) {
            $certifications = $request->input('certifications');
            if (is_string($certifications)) {
                $decoded = json_decode($certifications, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['certifications'] = $decoded;
                }
            } elseif (is_array($certifications)) {
                $validated['certifications'] = $certifications;
            }
        }

        // Handle social_links (can be JSON string from FormData)
        if ($request->has('social_links')) {
            $socialLinks = $request->input('social_links');
            if (is_string($socialLinks)) {
                $decoded = json_decode($socialLinks, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $validated['social_links'] = $decoded;
                }
            } elseif (is_array($socialLinks)) {
                $validated['social_links'] = $socialLinks;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($teamMember->image && Storage::disk('public')->exists($teamMember->image)) {
                Storage::disk('public')->delete($teamMember->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name'] ?? $teamMember->name) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('team', $filename, 'public');
            $validated['image'] = $path;
        }

        $teamMember->update($validated);

        return response()->json($teamMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $teamMember = TeamMember::findOrFail($id);

        // Delete image if exists
        if ($teamMember->image && Storage::disk('public')->exists($teamMember->image)) {
            Storage::disk('public')->delete($teamMember->image);
        }

        $teamMember->delete();

        return response()->json(['message' => 'Team member deleted successfully']);
    }
}
