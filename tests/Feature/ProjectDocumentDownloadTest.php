<?php

namespace Tests\Feature;

use App\Models\AdministrativeDivision;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectTask;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectDocumentDownloadTest extends TestCase
{
    use RefreshDatabase;

    private function division(): AdministrativeDivision
    {
        return AdministrativeDivision::create([
            'level' => 'province',
            'name' => 'Province Test',
            'slug' => 'province-test-'.uniqid(),
        ]);
    }

    private function user(string $role = 'buyer'): User
    {
        return User::create([
            'name' => 'Utilisateur Test',
            'email' => 'user-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => $role,
        ]);
    }

    private function project(User $owner, array $overrides = []): Project
    {
        return Project::create(array_merge([
            'user_id' => $owner->id,
            'project_number' => 'PRJ-'.uniqid(),
            'division_id' => $this->division()->id,
            'title' => 'Projet Test',
            'status' => 'in_execution',
        ], $overrides));
    }

    private function document(Project $project, User $uploader, array $overrides = []): ProjectDocument
    {
        return ProjectDocument::create(array_merge([
            'project_id' => $project->id,
            'uploaded_by' => $uploader->id,
            'type' => 'general',
            'stage' => 'execution',
            'name' => 'document.pdf',
            'path' => "projects/{$project->id}/document.pdf",
            'disk' => 'local',
            'mime_type' => 'application/pdf',
            'size' => 1000,
        ], $overrides));
    }

    public function test_task_report_upload_is_stored_on_the_local_disk(): void
    {
        $owner = $this->user();
        $project = $this->project($owner);
        $task = ProjectTask::create([
            'project_id' => $project->id,
            'title' => 'Tâche Test',
            'responsible_user_id' => $owner->id,
        ]);

        Storage::fake('local');

        $file = UploadedFile::fake()->create('rapport.pdf', 100, 'application/pdf');

        $this->actingAs($owner)
            ->post("/projects/{$project->id}/tasks/{$task->id}/report", [
                'body' => 'Travail terminé.',
                'document' => $file,
            ])
            ->assertSessionHas('success');

        $document = ProjectDocument::where('project_id', $project->id)->first();
        $this->assertNotNull($document);
        $this->assertSame('local', $document->disk);
        Storage::disk('local')->assertExists($document->path);
    }

    public function test_project_owner_can_download_a_document(): void
    {
        $owner = $this->user();
        $project = $this->project($owner);
        $document = $this->document($project, $owner);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $this->actingAs($owner)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_project_manager_can_download_a_document(): void
    {
        $owner = $this->user();
        $manager = $this->user();
        $project = $this->project($owner, ['project_manager_id' => $manager->id]);
        $document = $this->document($project, $owner);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $this->actingAs($manager)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_task_responsible_user_can_download_the_documents_task(): void
    {
        $owner = $this->user();
        $taskOwner = $this->user();
        $project = $this->project($owner);
        $task = ProjectTask::create([
            'project_id' => $project->id,
            'title' => 'Tâche Test',
            'responsible_user_id' => $taskOwner->id,
        ]);
        $document = $this->document($project, $owner, ['project_task_id' => $task->id]);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $this->actingAs($taskOwner)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_government_reviewer_can_download_when_project_is_in_a_visible_stage(): void
    {
        $owner = $this->user();
        $project = $this->project($owner, ['status' => 'tutelage_pending']);
        $document = $this->document($project, $owner);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $officer = $this->user('government');

        $this->actingAs($officer)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_government_reviewer_cannot_download_when_project_is_in_a_non_visible_stage(): void
    {
        $owner = $this->user();
        $project = $this->project($owner, ['status' => 'draft']);
        $document = $this->document($project, $owner);

        $officer = $this->user('government');

        $this->actingAs($officer)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertForbidden();
    }

    public function test_unrelated_user_is_forbidden(): void
    {
        $owner = $this->user();
        $project = $this->project($owner);
        $document = $this->document($project, $owner);

        $stranger = $this->user();

        $this->actingAs($stranger)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertForbidden();
    }

    public function test_a_document_from_another_project_is_refused_even_for_an_authorized_user(): void
    {
        $owner = $this->user();
        $projectA = $this->project($owner);
        $projectB = $this->project($owner);

        // Document belongs to project B, but requested through project A's URL.
        $document = $this->document($projectB, $owner);

        $this->actingAs($owner)
            ->get("/projects/{$projectA->id}/documents/{$document->id}/download")
            ->assertNotFound();
    }

    public function test_admin_can_download_any_project_document(): void
    {
        $owner = $this->user();
        $project = $this->project($owner, ['status' => 'draft']);
        $document = $this->document($project, $owner);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $admin = $this->user('super_admin');

        $this->actingAs($admin)
            ->get("/projects/{$project->id}/documents/{$document->id}/download")
            ->assertOk();
    }
}
