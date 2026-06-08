<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->enum('report_type', [
                'sales',
                'products',
                'stock',
                'customers',
                'platform',
            ]);
            $table->enum('format', ['pdf', 'excel'])->default('pdf');
            $table->string('file_path')->nullable();
            $table->json('filters')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamp('period_from')->nullable();
            $table->timestamp('period_to')->nullable();
            $table->timestamps();

            $table->index(['generated_by', 'report_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
