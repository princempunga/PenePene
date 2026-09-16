<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ProposalController::store() writes to a *different* table than
     * project_documents — proposal_documents, via the ProposalDocument
     * model — despite uploading through the same 'public' disk. Same fix,
     * same pattern.
     */
    public function up(): void
    {
        Schema::table('proposal_documents', function (Blueprint $table) {
            $table->string('disk')->default('public')->after('path');
        });
    }

    public function down(): void
    {
        Schema::table('proposal_documents', function (Blueprint $table) {
            $table->dropColumn('disk');
        });
    }
};
