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
        Schema::table('messages', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['attachment', 'attachment_type']);
            
            // Add new columns
            $table->foreignId('receiver_id')->after('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('message_type')->default('text')->after('receiver_id'); // text, image, video, file
            
            // Allow body to be nullable since a message could just be an attachment
            $table->text('body')->nullable()->change();

            $table->string('attachment_path')->nullable()->after('body');
            $table->string('attachment_mime')->nullable()->after('attachment_path');
            $table->unsignedBigInteger('attachment_size')->nullable()->after('attachment_mime');
            
            $table->boolean('is_read')->default(false)->after('attachment_size');
            
            $table->boolean('is_edited')->default(false)->after('read_at');
            $table->timestamp('edited_at')->nullable()->after('is_edited');
            
            $table->boolean('is_deleted')->default(false)->after('edited_at');
            $table->timestamp('deleted_at')->nullable()->after('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['receiver_id']);
            $table->dropColumn([
                'receiver_id', 'message_type', 'attachment_path', 'attachment_mime', 
                'attachment_size', 'is_read', 'is_edited', 'edited_at', 'is_deleted', 'deleted_at'
            ]);
            
            $table->text('body')->nullable(false)->change();
            $table->string('attachment')->nullable();
            $table->enum('attachment_type', ['image', 'file'])->nullable();
        });
    }
};
