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

        $products = Product::with('category')
            ->where('seller_id', $seller->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Seller/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(Request $request)
    {
        $categories = Category::whereNull('parent_id')
            ->with('children')
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
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0|lt:price',
            'initial_stock'  => 'required|integer|min:1',
            'condition'      => 'required|in:new,used,refurbished',
            'images.*'       => 'nullable|image|max:2048',
        ]);

        $product = Product::create([
            'seller_id'       => $seller->id,
            'category_id'     => $request->category_id,
            'name'            => $request->name,
            'slug'            => Str::slug($request->name) . '-' . uniqid(),
            'description'     => $request->description,
            'price'           => $request->price,
            'sale_price'      => $request->sale_price,
            'initial_stock'   => $request->initial_stock,
            'confirmed_sales' => 0,
            'condition'       => $request->condition,
            'status'          => 'active', // or 'pending' if moderation is required
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
            ->with('success', 'Product created successfully.');
    }

    public function edit(Request $request, Product $product)
    {
        $seller = $request->user()->seller;

        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        $categories = Category::whereNull('parent_id')
            ->with('children')
            ->get();
            
        $product->load('images');

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

        $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0|lt:price',
            'initial_stock'  => 'required|integer|min:0',
            'condition'      => 'required|in:new,used,refurbished',
            'status'         => 'required|in:active,inactive,out_of_stock',
        ]);

        $product->update([
            'category_id'   => $request->category_id,
            'name'          => $request->name,
            // don't change slug normally, or you can update it
            'description'   => $request->description,
            'price'         => $request->price,
            'sale_price'    => $request->sale_price,
            'initial_stock' => $request->initial_stock,
            'condition'     => $request->condition,
            'status'        => $request->status,
        ]);

        return redirect()->route('seller.products.index')
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
            'is_primary' => !$hasPrimary, // make primary if it's the first one
        ]);

        return back()->with('success', 'Image uploaded successfully.');
    }

    public function deleteImage(Request $request, ProductImage $image)
    {
        $seller = $request->user()->seller;
        
        // Ensure image belongs to a product owned by this seller
        $product = Product::findOrFail($image->product_id);
        if ($product->seller_id !== $seller->id) {
            abort(403);
        }

        Storage::disk('public')->delete($image->image_path);
        
        $wasPrimary = $image->is_primary;
        $image->delete();

        // If we deleted the primary, make another image primary
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

        // Optional: you might want to soft delete instead if orders depend on it
        $product->delete();

        return redirect()->route('seller.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
