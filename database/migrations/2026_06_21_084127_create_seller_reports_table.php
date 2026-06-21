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
        Schema::create('seller_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_seller_id')->constrained('sellers')->cascadeOnDelete();
            $table->string('category');
            $table->text('description');
            $table->json('evidence_files')->nullable(); // Arrays of image/doc paths
            $table->enum('status', ['pending', 'investigating', 'resolved', 'rejected', 'seller_suspended'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_reports');
    }
};
