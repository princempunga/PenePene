<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // CACHE_STORE=array in testing persists for the whole PHPUnit
        // process, not per-test — without this, whichever test runs first
        // would poison every other test's assertions with its own cached
        // sitemap.xml body.
        Cache::forget('sitemap.xml');
    }

    private function makeSeller(string $status = 'verified'): Seller
    {
        $user = User::create([
            'name' => 'Vendeur Sitemap',
            'email' => 'sitemap-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        return Seller::create([
            'user_id' => $user->id,
            'business_name' => 'Boutique Sitemap',
            'slug' => 'boutique-sitemap-'.uniqid(),
            'status' => $status,
        ]);
    }

    private function makeCategory(): Category
    {
        return Category::create([
            'name' => 'Catégorie Sitemap',
            'slug' => 'categorie-sitemap-'.uniqid(),
            'is_active' => true,
        ]);
    }

    private function makeProduct(Seller $seller, Category $category, string $status): Product
    {
        return Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'name' => 'Produit Sitemap '.$status,
            'slug' => 'produit-sitemap-'.$status.'-'.uniqid(),
            'description' => 'Description',
            'price' => 10,
            'status' => $status,
        ]);
    }

    public function test_sitemap_returns_xml_with_active_products_but_not_pending_ones(): void
    {
        $seller = $this->makeSeller();
        $category = $this->makeCategory();

        $activeProduct = $this->makeProduct($seller, $category, 'active');
        $pendingProduct = $this->makeProduct($seller, $category, 'pending');

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/xml; charset=UTF-8');

        $content = $response->getContent();

        $this->assertStringContainsString("/products/{$activeProduct->slug}", $content);
        $this->assertStringNotContainsString("/products/{$pendingProduct->slug}", $content);
    }

    public function test_sitemap_excludes_rejected_and_inactive_products(): void
    {
        $seller = $this->makeSeller();
        $category = $this->makeCategory();

        $rejected = $this->makeProduct($seller, $category, 'rejected');
        $inactive = $this->makeProduct($seller, $category, 'inactive');

        $content = $this->get('/sitemap.xml')->getContent();

        $this->assertStringNotContainsString("/products/{$rejected->slug}", $content);
        $this->assertStringNotContainsString("/products/{$inactive->slug}", $content);
    }

    public function test_sitemap_includes_verified_sellers_but_not_pending_ones(): void
    {
        $verifiedSeller = $this->makeSeller('verified');
        $pendingSeller = $this->makeSeller('pending');

        $content = $this->get('/sitemap.xml')->getContent();

        $this->assertStringContainsString("/sellers/{$verifiedSeller->slug}", $content);
        $this->assertStringNotContainsString("/sellers/{$pendingSeller->slug}", $content);
    }

    public function test_sitemap_includes_static_pages(): void
    {
        $content = $this->get('/sitemap.xml')->getContent();

        $this->assertStringContainsString('<loc>'.config('app.url').'</loc>', $content);
        $this->assertStringContainsString('/about', $content);
        $this->assertStringContainsString('/contact', $content);
    }

    public function test_sitemap_response_is_cached(): void
    {
        $seller = $this->makeSeller();
        $category = $this->makeCategory();
        $product = $this->makeProduct($seller, $category, 'active');

        $first = $this->get('/sitemap.xml')->getContent();

        // Deleting the product after the first request must not change the
        // response within the cache window — proves generation is cached
        // rather than recomputed on every request.
        $product->delete();

        $second = $this->get('/sitemap.xml')->getContent();

        $this->assertSame($first, $second);
        $this->assertStringContainsString("/products/{$product->slug}", $second);
    }
}
