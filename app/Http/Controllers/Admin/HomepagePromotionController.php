<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepagePromotion;
use App\Models\Seller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomepagePromotionController extends Controller
{
    public function index()
    {
        $promotions = HomepagePromotion::with([
            'seller.user',
            'product.images',
            'product.category',
        ])
        ->orderBy('promotion_order')
        ->get()
        ->map(fn ($promo) => $this->formatPromotion($promo));

        $sellers = Seller::with('user')
            ->active()
            ->orderBy('business_name')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'business_name' => $s->business_name,
                'user_name'     => $s->user?->name,
            ]);

        return Inertia::render('Admin/Promotions/Index', [
            'promotions' => $promotions,
            'sellers'    => $sellers,
        ]);
    }

    /**
     * Get products for a specific seller (AJAX).
     */
    public function sellerProducts(Seller $seller)
    {
        $products = Product::where('seller_id', $seller->id)
            ->where('status', 'active')
            ->with('images')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'price'     => $p->sale_price ?? $p->price,
                'currency'  => $p->currency,
                'image_url' => $this->productImageUrl($p),
            ]);

        return response()->json(['products' => $products]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedPromotionData($request);

        HomepagePromotion::where('promotion_order', $data['promotion_order'])->delete();

        if ($request->hasFile('custom_image')) {
            $data['custom_image_url'] = $this->storeHeroImage($request->file('custom_image'));
        }

        unset($data['custom_image']);

        HomepagePromotion::create($data);

        return back()->with('success', 'Promotion créée avec succès.');
    }

    public function update(Request $request, HomepagePromotion $promotion)
    {
        $data = $this->validatedPromotionData($request, isUpdate: true);

        if ($request->hasFile('custom_image')) {
            $this->deleteStoredHeroImage($promotion->custom_image_url);
            $data['custom_image_url'] = $this->storeHeroImage($request->file('custom_image'));
        }

        unset($data['custom_image']);

        $promotion->update($data);

        return back()->with('success', 'Promotion mise à jour avec succès.');
    }

    public function destroy(HomepagePromotion $promotion)
    {
        $this->deleteStoredHeroImage($promotion->custom_image_url);
        $promotion->delete();

        return back()->with('success', 'Promotion supprimée.');
    }

    private function validatedPromotionData(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'seller_id'        => ($isUpdate ? 'sometimes' : 'required') . '|exists:sellers,id',
            'product_id'       => ($isUpdate ? 'sometimes' : 'required') . '|exists:products,id',
            'custom_image'     => 'nullable|image|max:5120',
            'custom_image_url' => 'nullable|string|max:500',
            'headline'         => 'nullable|string|max:100',
            'promotion_order'  => ($isUpdate ? 'sometimes' : 'required') . '|integer|between:1,10',
            'is_active'        => 'nullable|in:0,1,true,false,on,off',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
        ];

        $data = $request->validate($rules);
        $data['is_active'] = $request->boolean('is_active');
        $data['starts_at'] = $request->input('starts_at') ?: null;
        $data['ends_at'] = $request->input('ends_at') ?: null;
        $data['headline'] = $request->input('headline') ?: null;
        $data['custom_image_url'] = $request->input('custom_image_url') ?: null;

        return $data;
    }

    private function formatPromotion(HomepagePromotion $promo): array
    {
        return [
            'id'               => $promo->id,
            'promotion_order'  => $promo->promotion_order,
            'seller_id'        => $promo->seller_id,
            'product_id'       => $promo->product_id,
            'custom_image_url' => $promo->custom_image_url,
            'hero_image_url'   => $this->resolveHeroImage($promo),
            'headline'         => $promo->headline,
            'is_active'        => $promo->is_active,
            'starts_at'        => $promo->starts_at,
            'ends_at'          => $promo->ends_at,
            'product_name'     => $promo->product?->name,
            'seller_name'      => $promo->seller?->business_name,
        ];
    }

    private function resolveHeroImage(HomepagePromotion $promo): ?string
    {
        if ($promo->custom_image_url) {
            return $this->normalizePublicUrl($promo->custom_image_url);
        }

        return $this->productImageUrl($promo->product);
    }

    private function productImageUrl(?Product $product): ?string
    {
        if (!$product) {
            return null;
        }

        $image = $product->images?->where('is_primary', true)->first()
              ?? $product->images?->first();

        if (!$image?->image_path) {
            return null;
        }

        return $this->normalizePublicUrl($image->image_path);
    }

    private function normalizePublicUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return $path;
        }

        if (str_starts_with($path, 'images/')) {
            return '/' . $path;
        }

        return '/storage/' . ltrim($path, '/');
    }

    private function storeHeroImage($file): string
    {
        $path = $file->store('homepage-promotions', 'public');

        return '/storage/' . $path;
    }

    private function deleteStoredHeroImage(?string $url): void
    {
        if (!$url || !str_starts_with($url, '/storage/')) {
            return;
        }

        $relative = str_replace('/storage/', '', $url);

        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
