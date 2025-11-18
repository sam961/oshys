<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use TranslatableController;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'translations']);

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by in stock
        if ($request->has('in_stock')) {
            $query->where('in_stock', filter_var($request->in_stock, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        // Add translations to response
        $products = $this->transformWithTranslations($products);

        return response()->json($products);
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
            'category_id' => 'nullable|exists:categories,id',
            'in_stock' => 'nullable',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'stock_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            // Translation fields can be JSON strings from FormData
            'name_translations' => 'nullable',
            'description_translations' => 'nullable',
            'details_translations' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans
        $validated['in_stock'] = filter_var($request->input('in_stock', true), FILTER_VALIDATE_BOOLEAN);
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name']) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $validated['image'] = $path;
        }

        $validated['slug'] = Str::slug($validated['name']);

        // Remove translation fields from validated data (they'll be handled separately)
        unset($validated['name_translations'], $validated['description_translations'], $validated['details_translations']);

        $product = Product::create($validated);

        // Save translations - decode JSON strings if needed
        $this->saveTranslationsFromRequest($product, $request);

        return response()->json($product->load('translations'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'translations'])->findOrFail($id);
        return response()->json($product->toArrayWithTranslations());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'details' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'in_stock' => 'nullable',
            'is_active' => 'nullable',
            'is_featured' => 'nullable',
            'stock_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $id,
            // Translation fields can be JSON strings from FormData
            'name_translations' => 'nullable',
            'description_translations' => 'nullable',
            'details_translations' => 'nullable',
        ]);

        // Convert boolean strings to actual booleans if present
        if ($request->has('in_stock')) {
            $validated['in_stock'] = filter_var($request->input('in_stock'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $image = $request->file('image');
            $filename = time() . '_' . Str::slug($validated['name'] ?? $product->name) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Remove translation fields from validated data (they'll be handled separately)
        unset($validated['name_translations'], $validated['description_translations'], $validated['details_translations']);

        $product->update($validated);

        // Save translations - decode JSON strings if needed
        $this->saveTranslationsFromRequest($product, $request);

        return response()->json($product->load('translations'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete image if exists
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
