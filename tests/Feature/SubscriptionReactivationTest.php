<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionProductDisable;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionReactivationTest extends TestCase
{
    use RefreshDatabase;

    private function makeSeller(): Seller
    {
        $user = User::create([
            'name' => 'Vendeur Sub',
            'email' => 'sub-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        return Seller::create([
            'user_id' => $user->id,
            'business_name' => 'Boutique Sub',
            'slug' => 'boutique-sub-'.uniqid(),
        ]);
    }

    private function makeProduct(Seller $seller, string $status = 'inactive'): Product
    {
        $category = Category::create([
            'name' => 'Catégorie Test',
            'slug' => 'categorie-test-'.uniqid(),
            'is_active' => true,
        ]);

        return Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'name' => 'Produit Test',
            'slug' => 'produit-test-'.uniqid(),
            'description' => 'Description',
            'price' => 10,
            'status' => $status,
        ]);
    }

    private function unlimitedSubscriptionFor(Seller $seller): Subscription
    {
        $plan = SubscriptionPlan::create([
            'name' => 'Illimité',
            'slug' => 'illimite-'.uniqid(),
            'product_limit' => null,
        ]);

        return Subscription::create([
            'seller_id' => $seller->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addYear(),
        ]);
    }

    public function test_reactivates_a_product_still_untouched_since_it_was_disabled(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, 'inactive');

        $disable = SubscriptionProductDisable::create([
            'seller_id' => $seller->id,
            'product_id' => $product->id,
            'reason' => 'downgrade',
        ]);

        $sub = $this->unlimitedSubscriptionFor($seller);

        $count = app(SubscriptionService::class)->reactivateDisabledProducts($seller, $sub);

        $this->assertSame(1, $count);
        $this->assertSame('active', $product->fresh()->status);
        $this->assertNotNull($disable->fresh()->reactivated_at);
        $this->assertNull($disable->fresh()->skip_reason);
    }

    public function test_does_not_reactivate_a_product_rejected_by_an_admin_since_it_was_disabled(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, 'inactive');

        $disable = SubscriptionProductDisable::create([
            'seller_id' => $seller->id,
            'product_id' => $product->id,
            'reason' => 'downgrade',
        ]);

        // Un admin rejette le produit après la désactivation abonnement —
        // updated_at avance, le statut change.
        $product->update(['status' => 'rejected']);

        $sub = $this->unlimitedSubscriptionFor($seller);

        $count = app(SubscriptionService::class)->reactivateDisabledProducts($seller, $sub);

        $this->assertSame(0, $count);
        $this->assertSame('rejected', $product->fresh()->status);

        $fresh = $disable->fresh();
        $this->assertNotNull($fresh->reactivated_at, 'La ligne doit être refermée pour ne pas rester en attente indéfiniment.');
        $this->assertNotNull($fresh->skip_reason);
    }

    public function test_does_not_reactivate_a_product_modified_since_disable_even_if_still_inactive(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, 'inactive');

        $disable = SubscriptionProductDisable::create([
            'seller_id' => $seller->id,
            'product_id' => $product->id,
            'reason' => 'downgrade',
        ]);

        // Le produit reste 'inactive' mais a été modifié depuis (ex: admin
        // deactivate() pour une autre raison, ou édition du vendeur) —
        // updated_at avance sans que le statut change. On avance l'horloge
        // pour que la différence soit mesurable (les deux opérations se
        // produiraient sinon dans la même seconde dans ce test).
        $this->travel(1)->minute();
        $product->touch();

        $sub = $this->unlimitedSubscriptionFor($seller);

        $count = app(SubscriptionService::class)->reactivateDisabledProducts($seller, $sub);

        $this->assertSame(0, $count);
        $this->assertSame('inactive', $product->fresh()->status);
        $this->assertNotNull($disable->fresh()->skip_reason);
    }

    public function test_does_not_reactivate_a_soft_deleted_product(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, 'inactive');

        $disable = SubscriptionProductDisable::create([
            'seller_id' => $seller->id,
            'product_id' => $product->id,
            'reason' => 'downgrade',
        ]);

        $product->delete();

        $sub = $this->unlimitedSubscriptionFor($seller);

        $count = app(SubscriptionService::class)->reactivateDisabledProducts($seller, $sub);

        $this->assertSame(0, $count);
        $this->assertNotNull($disable->fresh()->skip_reason);
    }
}
