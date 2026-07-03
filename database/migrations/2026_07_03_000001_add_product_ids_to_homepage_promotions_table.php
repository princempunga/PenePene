<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_promotions', function (Blueprint $table) {
            $table->json('product_ids')->nullable()->after('product_id')->comment('Selected seller product IDs for hero slots');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_promotions', function (Blueprint $table) {
            $table->dropColumn('product_ids');
        });
    }
};
