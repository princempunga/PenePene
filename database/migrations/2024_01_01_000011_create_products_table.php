<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained()->nullOnDelete();

            // Core fields
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->string('currency', 10)->default('USD');
            $table->string('unit')->nullable(); // kg, piece, litre, etc.

            // Inventory
            $table->integer('initial_stock')->default(0);
            $table->integer('confirmed_sales')->default(0); // derived: initial_stock - confirmed_sales = available
            $table->integer('low_stock_threshold')->default(5);

            // Location (product may differ from seller's main location)
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Status & Visibility
            $table->enum('status', ['active', 'inactive', 'pending', 'rejected'])->default('pending');
            $table->boolean('is_featured')->default(false);
            $table->boolean('allow_contact')->default(true);

            // SEO
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();

            // Stats (denormalized)
            $table->integer('view_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['seller_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['subcategory_id', 'status']);
            $table->index('is_featured');
            $table->index(['latitude', 'longitude']);
            $table->index('price');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
