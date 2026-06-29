<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('project_number')->unique();
            $table->foreignId('division_id')->constrained('administrative_divisions');
            $table->string('title');
            $table->enum('category', [
                'infrastructure', 'education', 'health', 'agriculture',
                'security', 'environment', 'economy', 'social', 'other',
            ])->default('other');
            $table->enum('status', [
                'draft',
                'submitted_experts',
                'revision_requested',
                'approved',
                'tutelage_pending',
                'in_execution',
                'completed',
                'evaluated',
                'archived',
                'rejected',
            ])->default('draft');
            $table->enum('stage', [
                'design', 'expert_review', 'tutelage', 'execution', 'evaluation', 'archived',
            ])->default('design');
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedSmallInteger('planned_duration_days')->nullable();
            $table->date('planned_start_date')->nullable();
            $table->date('planned_end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('expert_review_deadline')->nullable();
            $table->timestamp('expert_reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('tutelage_submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('lessons_learned')->nullable();
            $table->text('evaluation_notes')->nullable();
            $table->boolean('is_public')->default(false);
            $table->foreignId('copied_from_project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'stage']);
        });

        Schema::create('project_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['primary', 'secondary']);
            $table->text('description');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('project_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('total_estimated', 18, 2)->nullable();
            $table->decimal('contingency_rate', 5, 2)->default(10);
            $table->decimal('contingency_amount', 18, 2)->nullable();
            $table->decimal('approved_amount', 18, 2)->nullable();
            $table->string('currency', 10)->default('CDF');
            $table->enum('defined_by', ['creator', 'internal_expert', 'external_expert'])->default('creator');
            $table->text('internal_expert_notes')->nullable();
            $table->text('external_expert_notes')->nullable();
            $table->boolean('creator_unsure')->default(false);
            $table->enum('status', ['draft', 'under_review', 'approved'])->default('draft');
            $table->timestamps();
        });

        Schema::create('project_budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_budget_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('amount', 18, 2);
            $table->string('category')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('project_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('importance', ['low', 'medium', 'high'])->default('medium');
            $table->unsignedSmallInteger('duration_days')->nullable();
            $table->date('planned_start')->nullable();
            $table->date('planned_end')->nullable();
            $table->date('actual_start')->nullable();
            $table->date('actual_end')->nullable();
            $table->enum('step_mode', [
                'successive', 'simultaneous', 'concurrent', 'synchronous', 'cumulative',
            ])->default('successive');
            $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('responsible_name')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'overdue', 'delayed'])->default('pending');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index('planned_end');
        });

        Schema::create('project_task_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('member_name')->nullable();
            $table->string('role')->nullable();
            $table->timestamps();
        });

        Schema::create('project_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('quantity')->default(1);
            $table->string('unit')->nullable();
            $table->enum('source', ['existing', 'import'])->default('existing');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('project_personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('role_title');
            $table->unsignedSmallInteger('count')->default(1);
            $table->enum('source', ['local', 'expatriate'])->default('local');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('project_constraints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['inevitable', 'manageable']);
            $table->text('description');
            $table->timestamps();
        });

        Schema::create('project_solutions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_constraint_id')->constrained()->cascadeOnDelete();
            $table->text('description');
            $table->enum('status', ['planned', 'applied'])->default('planned');
            $table->timestamps();
        });

        Schema::create('project_expert_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('decision', ['approved', 'revision_required', 'rejected'])->nullable();
            $table->text('comments')->nullable();
            $table->text('correction_notes')->nullable();
            $table->boolean('legal_deadline_met')->default(true);
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_tutelage_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('tutelage_service')->nullable();
            $table->enum('status', ['pending', 'submitted', 'approved', 'disbursement_in_progress', 'completed'])->default('pending');
            $table->enum('disbursement_status', ['pending', 'partial', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->enum('type', [
                'budget_proforma', 'invoice', 'task_report', 'justification', 'general', 'final_report',
            ])->default('general');
            $table->enum('stage', [
                'design', 'expert_review', 'tutelage', 'execution', 'evaluation',
            ])->default('design');
            $table->string('name');
            $table->string('path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();
        });

        Schema::create('project_task_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_on_time')->default(true);
            $table->text('delay_justification')->nullable();
            $table->timestamps();
        });

        Schema::create('project_delay_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('reason');
            $table->boolean('reported_before_deadline')->default(false);
            $table->date('new_planned_end')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('project_final_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->text('lessons_learned');
            $table->text('recommendations')->nullable();
            $table->enum('status', ['draft', 'submitted', 'evaluated'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->string('from_stage')->nullable();
            $table->string('to_stage')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('project_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['deadline_reminder', 'overdue_alert', 'expert_deadline'])->default('deadline_reminder');
            $table->timestamp('due_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_reminders');
        Schema::dropIfExists('project_status_histories');
        Schema::dropIfExists('project_final_reports');
        Schema::dropIfExists('project_delay_reports');
        Schema::dropIfExists('project_task_reports');
        Schema::dropIfExists('project_documents');
        Schema::dropIfExists('project_tutelage_records');
        Schema::dropIfExists('project_expert_reviews');
        Schema::dropIfExists('project_solutions');
        Schema::dropIfExists('project_constraints');
        Schema::dropIfExists('project_personnel');
        Schema::dropIfExists('project_materials');
        Schema::dropIfExists('project_task_members');
        Schema::dropIfExists('project_tasks');
        Schema::dropIfExists('project_budget_lines');
        Schema::dropIfExists('project_budgets');
        Schema::dropIfExists('project_interests');
        Schema::dropIfExists('projects');
    }
};
