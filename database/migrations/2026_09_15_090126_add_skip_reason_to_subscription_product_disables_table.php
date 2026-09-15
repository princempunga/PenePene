<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Explique pourquoi une ligne a été refermée (reactivated_at rempli)
     * sans que le produit ait réellement été remis à 'active' — ex: le
     * produit a été rejeté/bloqué/supprimé entre-temps par un admin ou
     * le vendeur, donc SubscriptionService::reactivateDisabledProducts()
     * a délibérément refusé de le réactiver.
     */
    public function up(): void
    {
        Schema::table('subscription_product_disables', function (Blueprint $table) {
            $table->string('skip_reason')->nullable()->after('reactivated_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_product_disables', function (Blueprint $table) {
            $table->dropColumn('skip_reason');
        });
    }
};
