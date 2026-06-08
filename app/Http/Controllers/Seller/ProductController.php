<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Product::with(['category', 'images'])
            ->where('seller_id', $seller->id)
            ->latest();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $products = $query->paginate(15)->withQueryString();

        return Inertia::render('Seller/Products/Index', [
            'products' => $products,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        $categories = Category::active()
            ->with(['subcategories' => fn ($q) => $q->active()->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Seller/Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $seller = $request->user()->seller;

        $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0|lt:price',
            'initial_stock'  => 'required|integer|min:1',
            'images.*'       => 'nullable|image|max:2048',
        ]);

        $product = Product::create([
            'seller_id'       => $seller->id,
            'category_id'     => $request->category_id,
            'subcategory_id'  => $request->subcategory_id,
            'name'            => $request->name,
            'slug'            => Str::slug($request->name) . '-' . uniqid(),
            'description'     => $request->description,
            'price'           => $request->price,
            'sale_price'      => $request->sale_price,
            'initial_stock'   => $request->initial_stock,
            'confirmed_sales' => 0,
            'currency'        => 'TZS',
            'status'          => 'pending',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return redirect()->route('seller.products.index')
            ->with('success', 'Product created successfully. It will be visible once approved.');
    }

    public function show(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $product->load(['category', 'subcategory', 'images']);

        return Inertia::render('Seller/Products/Show', [
            'product' => $product,
            'stats'   => [
                'available_stock' => $product->available_stock,
                'confirmed_sales' => $product->confirmed_sales,
                'view_count'      => $product->view_count,
                'average_rating'  => $product->average_rating,
                'total_reviews'   => $product->total_reviews,
            ],
        ]);
    }

    public function edit(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $categories = Category::active()
            ->with(['subcategories' => fn ($q) => $q->active()->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        $product->load(['category', 'subcategory', 'images']);

        return Inertia::render('Seller/Products/Edit', [
            'product'    => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $rules = [
            'category_id'    => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0|lt:price',
            'initial_stock'  => 'required|integer|min:0',
        ];

        if (in_array($product->status, ['active', 'inactive'])) {
            $rules['status'] = 'required|in:active,inactive';
        }

        $request->validate($rules);

        $data = [
            'category_id'   => $request->category_id,
            'subcategory_id'=> $request->subcategory_id,
            'name'          => $request->name,
            'description'   => $request->description,
            'price'         => $request->price,
            'sale_price'    => $request->sale_price,
            'initial_stock' => $request->initial_stock,
        ];

        if (in_array($product->status, ['active', 'inactive'])) {
            $data['status'] = $request->status;
        }

        $product->update($data);

        return redirect()->route('seller.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function uploadImage(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $hasPrimary = ProductImage::where('product_id', $product->id)->where('is_primary', true)->exists();

        $path = $request->file('image')->store('products', 'public');

        ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $path,
            'is_primary' => ! $hasPrimary,
        ]);

        return back()->with('success', 'Image uploaded successfully.');
    }

    public function deleteImage(Request $request, ProductImage $image)
    {
        $seller = $request->user()->seller;

        $product = Product::findOrFail($image->product_id);
        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        Storage::disk('public')->delete($image->image_path);

        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $nextImage = ProductImage::where('product_id', $product->id)->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return back()->with('success', 'Image deleted successfully.');
    }

    public function setPrimaryImage(Request $request, ProductImage $image)
    {
        $seller = $request->user()->seller;
        $product = Product::findOrFail($image->product_id);

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Primary image updated.');
    }

    public function destroy(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $product->delete();

        return redirect()->route('seller.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
