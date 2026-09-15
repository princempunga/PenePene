<?php

namespace Tests\Feature;

use App\Models\Seller;
use App\Models\SellerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSellerDocumentsViewTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin Test',
            'email' => 'admin-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);
    }

    private function sellerWithDocument(): array
    {
        $sellerUser = User::create([
            'name' => 'Vendeur KYC',
            'email' => 'vendeur-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        $seller = Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Boutique KYC',
            'slug' => 'boutique-kyc-'.uniqid(),
        ]);

        $document = SellerDocument::create([
            'seller_id' => $seller->id,
            'document_type' => 'national_id',
            'document_file' => 'seller_documents/carte.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        return [$seller, $document];
    }

    public function test_admin_sees_the_sellers_real_documents_on_the_show_page(): void
    {
        [$seller, $document] = $this->sellerWithDocument();

        $this->actingAs($this->admin())
            ->get("/admin/sellers/{$seller->slug}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Sellers/Show')
                ->has('seller.documents', 1)
                ->where('seller.documents.0.id', $document->id)
                ->where('seller.documents.0.document_type', 'national_id')
                ->where('seller.documents.0.status', 'pending')
            );
    }

    public function test_show_page_never_renders_a_direct_storage_link_for_documents(): void
    {
        [$seller, $document] = $this->sellerWithDocument();

        // The page component itself must reference the protected download
        // route for KYC documents, never a raw /storage/ path built from
        // doc.document_file (seller logo/avatar/product images legitimately
        // use /storage/ elsewhere on this same page — that's not the concern).
        $source = file_get_contents(resource_path('js/Pages/Admin/Sellers/Show.jsx'));

        $this->assertStringNotContainsString('doc.document_file', $source);
        $this->assertStringContainsString('/seller/documents/${doc.id}/download', $source);
    }

    public function test_admin_can_download_the_document_via_the_protected_route(): void
    {
        [$seller, $document] = $this->sellerWithDocument();

        \Illuminate\Support\Facades\Storage::disk('local')->put($document->document_file, 'fake-pdf-content');

        $this->actingAs($this->admin())
            ->get("/seller/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_seller_with_no_documents_shows_the_empty_state(): void
    {
        $sellerUser = User::create([
            'name' => 'Vendeur Sans Doc',
            'email' => 'nodoc-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        $seller = Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Boutique Sans Doc',
            'slug' => 'boutique-sans-doc-'.uniqid(),
        ]);

        $this->actingAs($this->admin())
            ->get("/admin/sellers/{$seller->slug}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Sellers/Show')
                ->has('seller.documents', 0)
            );
    }
}
