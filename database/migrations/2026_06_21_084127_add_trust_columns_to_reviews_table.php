<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->change();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->json('media')->nullable(); // Arrays of image/video paths
            $table->integer('helpful_votes')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable(false)->change();
            $table->dropForeign(['product_id']);
            $table->dropForeign(['conversation_id']);
            $table->dropColumn(['product_id', 'conversation_id', 'media', 'helpful_votes']);
        });
    }
};
