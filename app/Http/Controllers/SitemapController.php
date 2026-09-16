<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Support\Facades\Cache;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index()
    {
        $xml = Cache::remember('sitemap.xml', now()->addHours(6), function () {
            $sitemap = Sitemap::create();

            // Static pages
            $sitemap->add(Url::create('/')->setPriority(1.0));
            $sitemap->add(Url::create('/about')->setPriority(0.5));
            $sitemap->add(Url::create('/contact')->setPriority(0.5));

            // Products — only listings actually visible to the public.
            // Deliberately NOT Product::active() here: that scope also
            // requires inStock(), but a temporarily out-of-stock product
            // page is still live and should stay indexed. We only need to
            // exclude pending/rejected/inactive statuses.
            Product::where('status', 'active')
                ->select('slug', 'updated_at')
                ->chunk(500, function ($products) use ($sitemap) {
                    foreach ($products as $product) {
                        $sitemap->add(
                            Url::create("/products/{$product->slug}")
                                ->setLastModificationDate($product->updated_at)
                                ->setPriority(0.8)
                        );
                    }
                });

            // Categories — only active ones.
            Category::active()
                ->select('slug', 'updated_at')
                ->chunk(500, function ($categories) use ($sitemap) {
                    foreach ($categories as $category) {
                        $sitemap->add(
                            Url::create("/categories/{$category->slug}")
                                ->setLastModificationDate($category->updated_at)
                                ->setPriority(0.7)
                        );
                    }
                });

            // Sellers — only verified storefronts.
            Seller::verified()
                ->select('slug', 'updated_at')
                ->chunk(500, function ($sellers) use ($sitemap) {
                    foreach ($sellers as $seller) {
                        $sitemap->add(
                            Url::create("/sellers/{$seller->slug}")
                                ->setLastModificationDate($seller->updated_at)
                                ->setPriority(0.6)
                        );
                    }
                });

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'text/xml');
    }
}
