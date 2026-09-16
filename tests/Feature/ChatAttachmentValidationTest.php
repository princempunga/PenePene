<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Regression coverage for the mimes whitelist added to
 * ChatController::sendMessage() in commit 0777e2d — previously
 * 'attachment' => 'nullable|file|max:51200' accepted any file type,
 * including executable scripts disguised as chat attachments.
 */
class ChatAttachmentValidationTest extends TestCase
{
    use RefreshDatabase;

    private function buyerAndConversation(): array
    {
        $buyer = User::create([
            'name' => 'Acheteur Test',
            'email' => 'buyer-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'buyer',
        ]);

        $sellerUser = User::create([
            'name' => 'Vendeur Test',
            'email' => 'seller-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        $seller = Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Boutique Chat',
            'slug' => 'boutique-chat-'.uniqid(),
        ]);

        $conversation = Conversation::create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ]);

        return [$buyer, $conversation];
    }

    public function test_a_txt_attachment_is_rejected(): void
    {
        [$buyer, $conversation] = $this->buyerAndConversation();

        $file = UploadedFile::fake()->create('note.txt', 10);

        $response = $this->actingAs($buyer)
            ->postJson("/chat/conversations/{$conversation->id}/messages", [
                'attachment' => $file,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('attachment');
        $this->assertSame(0, Message::count());
    }

    public function test_a_php_file_renamed_is_rejected_even_with_plain_text_content(): void
    {
        [$buyer, $conversation] = $this->buyerAndConversation();

        // Content is plain text — the mimes rule must reject it purely on
        // the (spoofable) file extension, which is exactly why the server
        // can't fully trust it either; the real guarantee is the storage
        // hardening from the same commit (.htaccess disabling execution
        // under storage/app/public). This test only covers the validation
        // layer.
        $file = UploadedFile::fake()->createWithContent(
            'malware.php',
            "<?php echo 'just plain text, not really executed'; ?>"
        );

        $response = $this->actingAs($buyer)
            ->postJson("/chat/conversations/{$conversation->id}/messages", [
                'attachment' => $file,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('attachment');
        $this->assertSame(0, Message::count());
    }

    public function test_a_valid_jpg_under_the_size_limit_is_accepted(): void
    {
        Storage::fake('public');

        [$buyer, $conversation] = $this->buyerAndConversation();

        $file = UploadedFile::fake()->image('photo.jpg', 200, 200)->size(500); // 500 KB, well under the 50 MB limit

        $response = $this->actingAs($buyer)
            ->postJson("/chat/conversations/{$conversation->id}/messages", [
                'attachment' => $file,
            ]);

        $response->assertOk();
        $this->assertSame(1, Message::count());

        $message = Message::first();
        $this->assertSame('image', $message->message_type);
        $this->assertNotNull($message->attachment_path);
        Storage::disk('public')->assertExists($message->attachment_path);
    }
}
