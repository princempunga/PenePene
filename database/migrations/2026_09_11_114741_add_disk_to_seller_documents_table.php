<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tracks which filesystem disk a seller document's file lives on.
     * Existing rows default to 'public' (their true current location);
     * DocumentController now stores new uploads on the private 'local'
     * disk. The documents:migrate-to-private command flips existing
     * rows to 'local' once their file has been copied there.
     */
    public function up(): void
    {
        Schema::table('seller_documents', function (Blueprint $table) {
            $table->string('disk')->default('public')->after('document_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_documents', function (Blueprint $table) {
            $table->dropColumn('disk');
        });
    }
};
