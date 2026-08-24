<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerProductBulkDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_bulk_delete_selected_products(): void
    {
        $this->withoutMiddleware();

        $user = User::create([
            'name' => 'Vendeur Test',
            'email' => 'vendeur@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        $seller = Seller::create([
            'user_id' => $user->id,
            'business_name' => 'Boutique Test',
            'status' => 'verified',
        ]);

        $category = Category::create([
            'name' => 'Électronique',
            'slug' => 'electronique',
            'is_active' => true,
        ]);

        $productA = Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'name' => 'Produit A',
            'slug' => 'produit-a',
            'description' => 'Description A',
            'price' => 100,
            'initial_stock' => 10,
            'status' => 'active',
        ]);

        $productB = Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'name' => 'Produit B',
            'slug' => 'produit-b',
            'description' => 'Description B',
            'price' => 200,
            'initial_stock' => 20,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('seller.products.bulk-delete'), [
                'ids' => [$productA->id, $productB->id],
            ])
            ->assertRedirect(route('seller.products.index'))
            ->assertSessionHas('success');

        $this->assertSoftDeleted('products', ['id' => $productA->id]);
        $this->assertSoftDeleted('products', ['id' => $productB->id]);
    }
}
