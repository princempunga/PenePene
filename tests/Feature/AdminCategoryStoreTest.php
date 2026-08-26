<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryStoreTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);
    }

    public function test_creates_top_level_category_when_subcategory_is_empty(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'name' => 'Électronique',
                'subcategory_name' => '',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'name' => 'Électronique',
            'slug' => 'electronique',
            'parent_id' => null,
        ]);

        $this->assertSame(1, Category::count());
    }

    public function test_creates_parent_and_attaches_subcategory(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'name' => 'Électronique',
                'subcategory_name' => 'Téléphones',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $parent = Category::where('slug', 'electronique')->first();
        $this->assertNotNull($parent);
        $this->assertNull($parent->parent_id);

        $child = Category::where('slug', 'electronique-telephones')->first();
        $this->assertNotNull($child);
        $this->assertSame($parent->id, $child->parent_id);

        $this->assertSame(2, Category::count());
    }

    public function test_reuses_existing_parent_by_id_and_adds_subcategory(): void
    {
        $parent = Category::create([
            'name' => 'Électronique',
            'slug' => 'electronique',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'category_id' => $parent->id,
                'name' => '',
                'subcategory_name' => 'Téléphones',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        // The picked parent must be reused, not duplicated.
        $this->assertSame(1, Category::where('slug', 'electronique')->count());

        $child = Category::where('slug', 'electronique-telephones')->first();
        $this->assertNotNull($child);
        $this->assertSame($parent->id, $child->parent_id);

        $this->assertSame(2, Category::count());
    }

    public function test_empty_submission_is_rejected_with_a_validation_error(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'category_id' => '',
                'name' => '',
                'subcategory_name' => '',
            ])
            ->assertSessionHasErrors('name');

        $this->assertSame(0, Category::count());
    }

    public function test_typing_an_existing_name_reuses_it_without_duplicating(): void
    {
        Category::create([
            'name' => 'Électronique',
            'slug' => 'electronique',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'name' => 'Électronique',
                'subcategory_name' => '',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(1, Category::count());
    }
}
