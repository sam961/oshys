<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
            'image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'in_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            // Translation fields
            'name_translations' => 'nullable|array',
            'description_translations' => 'nullable|array',
            'details_translations' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $product = Product::create($validated);

        // Save translations
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
            'image' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'in_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $id,
            // Translation fields
            'name_translations' => 'nullable|array',
            'description_translations' => 'nullable|array',
            'details_translations' => 'nullable|array',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        // Save translations
        $this->saveTranslationsFromRequest($product, $request);

        return response()->json($product->load('translations'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
