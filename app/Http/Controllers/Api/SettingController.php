<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by group
        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        // Filter by key
        if ($request->has('key')) {
            $query->where('key', $request->key);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%")
                  ->orWhere('group', 'like', "%{$search}%");
            });
        }

        $settings = $query->orderBy('group', 'asc')
                          ->orderBy('key', 'asc')
                          ->get();

        return response()->json($settings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:settings,key',
            'value' => 'nullable|string',
            'type' => 'required|string|max:255',
            'group' => 'nullable|string|max:255',
        ]);

        $setting = Setting::create($validated);

        return response()->json($setting, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $setting = Setting::findOrFail($id);
        return response()->json($setting);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $setting = Setting::findOrFail($id);

        $validated = $request->validate([
            'key' => 'sometimes|required|string|max:255|unique:settings,key,' . $id,
            'value' => 'nullable|string',
            'type' => 'sometimes|required|string|max:255',
            'group' => 'nullable|string|max:255',
        ]);

        $setting->update($validated);

        return response()->json($setting);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $setting = Setting::findOrFail($id);
        $setting->delete();

        return response()->json(['message' => 'Setting deleted successfully']);
    }
}
