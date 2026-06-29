<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Champs de mise en avant produit (système sponsorisé par priorité sous-catégorie).
 * Facturation future via promotion_status / sponsored_until — paiement non intégré.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedSmallInteger('priority_position')->nullable()->after('is_featured');
            $table->timestamp('sponsored_until')->nullable()->after('priority_position');
            $table->string('promotion_status', 20)->default('inactive')->after('sponsored_until');

            $table->index(['subcategory_id', 'priority_position']);
            $table->index(['promotion_status', 'sponsored_until']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['subcategory_id', 'priority_position']);
            $table->dropIndex(['promotion_status', 'sponsored_until']);
            $table->dropColumn(['priority_position', 'sponsored_until', 'promotion_status']);
        });
    }
};
