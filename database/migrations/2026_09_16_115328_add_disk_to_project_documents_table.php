<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Same pattern as add_disk_to_seller_documents_table: tracks which
     * filesystem disk a project document's file lives on. Existing rows
     * default to 'public' (their true current location); the upload
     * controllers now store new files on the private 'local' disk.
     */
    public function up(): void
    {
        Schema::table('project_documents', function (Blueprint $table) {
            $table->string('disk')->default('public')->after('path');
        });
    }

    public function down(): void
    {
        Schema::table('project_documents', function (Blueprint $table) {
            $table->dropColumn('disk');
        });
    }
};
