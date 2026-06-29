<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('administrative_divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('administrative_divisions')->nullOnDelete();
            $table->enum('level', [
                'province', 'ville', 'territoire', 'commune', 'secteur', 'quartier',
            ]);
            $table->string('name');
            $table->string('code', 20)->nullable();
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['parent_id', 'level']);
            $table->index('level');
        });

        Schema::create('government_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('officer_level', ['commune', 'territory', 'provincial', 'national']);
            $table->foreignId('division_id')->nullable()->constrained('administrative_divisions')->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('department')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['officer_level', 'division_id']);
        });

        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('proposal_number')->unique();
            $table->foreignId('division_id')->constrained('administrative_divisions');
            $table->string('title');
            $table->text('summary');
            $table->text('body');
            $table->enum('category', [
                'infrastructure', 'education', 'health', 'agriculture',
                'security', 'environment', 'economy', 'social', 'other',
            ])->default('other');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', [
                'draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_requested',
            ])->default('draft');
            $table->enum('current_level', [
                'commune', 'territory', 'provincial', 'national',
            ])->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'current_level']);
            $table->index('division_id');
        });

        Schema::create('proposal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->index('proposal_id');
        });

        Schema::create('proposal_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_official')->default(false);
            $table->enum('visibility', ['public', 'internal'])->default('public');
            $table->timestamps();

            $table->index('proposal_id');
        });

        Schema::create('proposal_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->string('from_level')->nullable();
            $table->string('to_level')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('proposal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_status_histories');
        Schema::dropIfExists('proposal_comments');
        Schema::dropIfExists('proposal_documents');
        Schema::dropIfExists('proposals');
        Schema::dropIfExists('government_profiles');
        Schema::dropIfExists('administrative_divisions');
    }
};
