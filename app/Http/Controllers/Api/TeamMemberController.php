<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TeamMember::with('images');

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->active);
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
            'image' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'certifications' => 'nullable|array',
            'social_links' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

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
            'image' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'certifications' => 'nullable|array',
            'social_links' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $teamMember->update($validated);

        return response()->json($teamMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $teamMember = TeamMember::findOrFail($id);
        $teamMember->delete();

        return response()->json(['message' => 'Team member deleted successfully']);
    }
}
