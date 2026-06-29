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
        Schema::table('homepage_promotions', function (Blueprint $table) {
            if (!Schema::hasColumn('homepage_promotions', 'custom_image_url')) {
                $table->string('custom_image_url')->nullable()->after('product_id')->comment('Optional custom hero image');
            }
            if (!Schema::hasColumn('homepage_promotions', 'headline')) {
                $table->string('headline')->nullable()->after('custom_image_url')->comment('Optional promotional headline');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homepage_promotions', function (Blueprint $table) {
            $table->dropColumn(['custom_image_url', 'headline']);
        });
    }
};
