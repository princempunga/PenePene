<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── subscription_plans : limites + double devise ─────────────────────
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->unsignedInteger('product_limit')->nullable()
                ->comment('NULL = illimité');
            $table->unsignedInteger('featured_slots')->default(0)
                ->comment('Nombre de mises en avant incluses');
            $table->decimal('price_usd', 10, 2)->nullable();
            $table->decimal('price_cdf', 12, 2)->nullable();
            $table->boolean('is_active')->default(true)->change();
        });

        // ── subscriptions : compteur mises en avant + devise choisie ────────
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedInteger('featured_used')->default(0);
            $table->boolean('auto_renew')->default(false);
        });

        // ── Historique des changements de plan ──────────────────────────────
        if (! Schema::hasTable('subscription_plan_changes')) {
            Schema::create('subscription_plan_changes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
                $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
                $table->unsignedBigInteger('from_plan_id')->nullable();
                $table->unsignedBigInteger('to_plan_id')->nullable();
                $table->string('action', 20)->comment('upgrade|downgrade|switch|new|expire');
                $table->decimal('amount', 12, 2)->default(0);
                $table->string('currency', 10)->default('USD');
                $table->string('payment_reference')->nullable();
                $table->text('note')->nullable();
                $table->unsignedBigInteger('changed_by')->nullable()->comment('Admin ID si action manuelle');
                $table->timestamps();

                $table->index(['seller_id', 'created_at']);
            });
        }

        // ── Produits excédentaires désactivés lors d'un downgrade/expiration ─
        if (! Schema::hasTable('subscription_product_disables')) {
            Schema::create('subscription_product_disables', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('subscription_id')->nullable();
                $table->string('reason', 30)->comment('downgrade|expired|admin');
                $table->timestamp('reactivated_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_product_disables');
        Schema::dropIfExists('subscription_plan_changes');

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['featured_used', 'auto_renew']);
        });

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['product_limit', 'featured_slots', 'price_usd', 'price_cdf']);
        });
    }
};
