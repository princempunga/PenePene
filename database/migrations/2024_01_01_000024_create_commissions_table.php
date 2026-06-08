<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->decimal('order_amount', 12, 2);
            $table->decimal('commission_rate', 5, 2)->default(0); // percentage e.g. 10.00
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('seller_payout', 12, 2)->default(0); // amount after commission
            $table->string('currency', 10)->default('TZS');
            $table->enum('status', ['pending', 'confirmed', 'paid', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'status']);
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
