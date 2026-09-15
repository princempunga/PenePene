<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Seller;
use App\Models\SellerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDocumentReviewTest extends TestCase
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

    private function sellerWithPendingDocument(): array
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

        return [$sellerUser, $seller, $document];
    }

    public function test_admin_can_verify_a_pending_document(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();
        $admin = $this->admin();

        $this->actingAs($admin)
            ->patch("/admin/documents/{$document->id}/verify")
            ->assertSessionHas('success');

        $document->refresh();
        $this->assertSame('verified', $document->status);
        $this->assertNull($document->rejection_reason);
        $this->assertNotNull($document->verified_at);
        $this->assertSame($admin->id, $document->verified_by);
    }

    public function test_admin_can_reject_a_pending_document_with_a_reason(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();
        $admin = $this->admin();

        $this->actingAs($admin)
            ->patch("/admin/documents/{$document->id}/reject", ['reason' => 'Photo illisible.'])
            ->assertSessionHas('success');

        $document->refresh();
        $this->assertSame('rejected', $document->status);
        $this->assertSame('Photo illisible.', $document->rejection_reason);
        $this->assertNotNull($document->verified_at);
        $this->assertSame($admin->id, $document->verified_by);
    }

    public function test_rejecting_a_document_without_a_reason_is_rejected_with_a_validation_error(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();

        $this->actingAs($this->admin())
            ->patch("/admin/documents/{$document->id}/reject", ['reason' => ''])
            ->assertSessionHasErrors('reason');

        $this->assertSame('pending', $document->fresh()->status);
    }

    public function test_a_seller_cannot_verify_or_reject_documents(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();

        $this->actingAs($sellerUser)
            ->patch("/admin/documents/{$document->id}/verify")
            ->assertForbidden();

        $this->actingAs($sellerUser)
            ->patch("/admin/documents/{$document->id}/reject", ['reason' => 'x'])
            ->assertForbidden();

        $this->assertSame('pending', $document->fresh()->status);
    }

    public function test_verifying_a_document_notifies_the_seller(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();

        $this->actingAs($this->admin())
            ->patch("/admin/documents/{$document->id}/verify");

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sellerUser->id,
            'type' => 'document',
        ]);

        $notification = Notification::where('user_id', $sellerUser->id)->first();
        $this->assertStringContainsString('vérifié', $notification->body);
    }

    public function test_rejecting_a_document_notifies_the_seller_with_the_reason(): void
    {
        [$sellerUser, $seller, $document] = $this->sellerWithPendingDocument();

        $this->actingAs($this->admin())
            ->patch("/admin/documents/{$document->id}/reject", ['reason' => 'Photo illisible.']);

        $notification = Notification::where('user_id', $sellerUser->id)->first();
        $this->assertNotNull($notification);
        $this->assertStringContainsString('rejeté', $notification->body);
        $this->assertStringContainsString('Photo illisible.', $notification->body);
    }
}
