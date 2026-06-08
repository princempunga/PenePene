<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsored_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->enum('placement', [
                'homepage_banner',
                'product_of_day',
                'product_of_week',
                'featured_listing',
                'category_top',
            ]);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            $table->enum('status', ['pending', 'active', 'expired', 'rejected'])->default('pending');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('impression_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'starts_at', 'expires_at']);
            $table->index('placement');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsored_products');
    }
};
