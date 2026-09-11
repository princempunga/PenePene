<?php

namespace Tests\Feature;

use App\Models\Seller;
use App\Models\SellerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SellerDocumentDownloadTest extends TestCase
{
    use RefreshDatabase;

    private function makeSeller(string $email): array
    {
        $user = User::create([
            'name' => 'Vendeur '.$email,
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        $seller = Seller::create([
            'user_id' => $user->id,
            'business_name' => 'Boutique '.$email,
            'status' => 'verified',
        ]);

        return [$user, $seller];
    }

    public function test_new_document_uploads_are_stored_on_the_private_disk(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        [$owner, $seller] = $this->makeSeller('owner@test.com');

        $this->actingAs($owner)
            ->post(route('seller.documents.store'), [
                'document_type' => 'national_id',
                'document_file' => UploadedFile::fake()->create('id.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHas('success');

        $document = SellerDocument::first();

        $this->assertSame('local', $document->disk);
        Storage::disk('local')->assertExists($document->document_file);
        Storage::disk('public')->assertMissing($document->document_file);
    }

    public function test_owning_seller_can_download_their_document(): void
    {
        Storage::fake('local');

        [$owner, $seller] = $this->makeSeller('owner2@test.com');

        Storage::disk('local')->put('seller_documents/id.pdf', 'fake-pdf-content');
        $document = SellerDocument::create([
            'seller_id' => $seller->id,
            'document_type' => 'national_id',
            'document_file' => 'seller_documents/id.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        $this->actingAs($owner)
            ->get(route('seller.documents.download', $document))
            ->assertOk();
    }

    public function test_another_seller_cannot_download_someone_elses_document(): void
    {
        Storage::fake('local');

        [, $ownerSeller] = $this->makeSeller('owner3@test.com');
        [$intruder] = $this->makeSeller('intruder@test.com');

        Storage::disk('local')->put('seller_documents/id.pdf', 'fake-pdf-content');
        $document = SellerDocument::create([
            'seller_id' => $ownerSeller->id,
            'document_type' => 'national_id',
            'document_file' => 'seller_documents/id.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        $this->actingAs($intruder)
            ->get(route('seller.documents.download', $document))
            ->assertForbidden();
    }

    public function test_admin_can_download_any_sellers_document(): void
    {
        Storage::fake('local');

        [, $seller] = $this->makeSeller('owner4@test.com');

        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        Storage::disk('local')->put('seller_documents/id.pdf', 'fake-pdf-content');
        $document = SellerDocument::create([
            'seller_id' => $seller->id,
            'document_type' => 'national_id',
            'document_file' => 'seller_documents/id.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->get(route('seller.documents.download', $document))
            ->assertOk();
    }
}
