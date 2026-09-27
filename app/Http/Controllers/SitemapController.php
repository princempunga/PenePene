<?php

/**
 * Sitemap generation controller.
 *
 * To regenerate the sitemap cache (e.g. after a deploy or data import):
 *
 *   php artisan tinker --execute="Cache::forget('sitemap.xml');"
 *
 * Or simply curl the endpoint to force a fresh render:
 *
 *   curl -s https://penepene.store/sitemap.xml > /dev/null
 *
 * The sitemap is cached for 6 hours. It contains:
 *   - Homepage (priority 1.0, changefreq daily)
 *   - Active products (priority 0.8, changefreq weekly, lastmod = updated_at)
 *   - Verified sellers (priority 0.7, changefreq weekly)
 *   - Active categories (priority 0.6, changefreq monthly)
 *
 * TODO: When the total number of URLs exceeds 50 000, switch to a
 *        sitemap index file (sitemap_index.xml) that references individual
 *        sitemap-*.xml shards. Each shard is limited to 50 000 URLs.
 *        See https://www.sitemaps.org/protocol.html#sitemapStructure
 */

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

            // ── Homepage ───────────────────────────────────────────────
            $sitemap->add(
                Url::create('/')
                    ->setPriority(1.0)
                    ->setChangeFrequency('daily')
            );

            // ── Static pages ────────────────────────────────────────────
            $sitemap->add(Url::create('/about')->setPriority(0.5));
            $sitemap->add(Url::create('/contact')->setPriority(0.5));

            // ── Products — only listings actually visible to the public.
            // Deliberately NOT Product::active() here: that scope also
            // requires inStock(), but a temporarily out-of-stock product
            // page is still live and should stay indexed. We only need to
            // exclude pending/rejected/inactive statuses.
            // Eager-load nothing extra (only slug/updated_at needed here),
            // but chunk() keeps memory low for large catalogs.
            Product::where('status', 'active')
                ->select('slug', 'updated_at')
                ->chunk(500, function ($products) use ($sitemap) {
                    foreach ($products as $product) {
                        $sitemap->add(
                            Url::create("/products/{$product->slug}")
                                ->setLastModificationDate($product->updated_at)
                                ->setPriority(0.8)
                                ->setChangeFrequency('weekly')
                        );
                    }
                });

            // ── Categories — only active ones.
            Category::active()
                ->select('slug', 'updated_at')
                ->chunk(500, function ($categories) use ($sitemap) {
                    foreach ($categories as $category) {
                        $sitemap->add(
                            Url::create("/categories/{$category->slug}")
                                ->setLastModificationDate($category->updated_at)
                                ->setPriority(0.6)
                                ->setChangeFrequency('monthly')
                        );
                    }
                });

            // ── Sellers — only verified storefronts.
            Seller::verified()
                ->select('slug', 'updated_at')
                ->chunk(500, function ($sellers) use ($sitemap) {
                    foreach ($sellers as $seller) {
                        $sitemap->add(
                            Url::create("/sellers/{$seller->slug}")
                                ->setLastModificationDate($seller->updated_at)
                                ->setPriority(0.7)
                                ->setChangeFrequency('weekly')
                        );
                    }
                });

            return $sitemap->render();
        });

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }
}
