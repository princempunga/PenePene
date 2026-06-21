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
        Schema::table('sellers', function (Blueprint $table) {
            $table->integer('strikes')->default(0);
            $table->decimal('trust_score', 5, 2)->default(100.00);
            $table->decimal('response_rate', 5, 2)->default(100.00); // Percentage
            $table->integer('response_time_minutes')->default(0); // Average response time
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['strikes', 'trust_score', 'response_rate', 'response_time_minutes']);
        });
    }
};
