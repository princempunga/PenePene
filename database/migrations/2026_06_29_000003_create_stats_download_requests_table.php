<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Demandes de téléchargement de statistiques vendeur (approbation admin requise).
 * Structure de facturation future — paiement non intégré.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stats_download_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->string('report_type', 30);
            $table->string('format', 10);
            $table->date('date_from');
            $table->date('date_to');
            $table->string('status', 20)->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('download_token', 64)->nullable()->unique();
            $table->timestamp('downloaded_at')->nullable();
            // Facturation future
            $table->decimal('billing_amount', 10, 2)->nullable();
            $table->string('billing_status', 20)->default('pending');
            $table->string('billing_reference')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stats_download_requests');
    }
};
