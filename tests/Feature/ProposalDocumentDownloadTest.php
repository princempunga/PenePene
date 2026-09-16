<?php

namespace Tests\Feature;

use App\Models\AdministrativeDivision;
use App\Models\GovernmentProfile;
use App\Models\Proposal;
use App\Models\ProposalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProposalDocumentDownloadTest extends TestCase
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

    private function proposal(User $owner, array $overrides = []): Proposal
    {
        return Proposal::create(array_merge([
            'user_id' => $owner->id,
            'proposal_number' => 'PROP-'.uniqid(),
            'division_id' => $this->division()->id,
            'title' => 'Proposition Test',
            'summary' => 'Résumé',
            'body' => 'Corps de la proposition',
            'status' => 'submitted',
            'current_level' => 'national',
        ], $overrides));
    }

    private function document(Proposal $proposal): ProposalDocument
    {
        return ProposalDocument::create([
            'proposal_id' => $proposal->id,
            'name' => 'document.pdf',
            'path' => "proposals/{$proposal->id}/document.pdf",
            'disk' => 'local',
            'mime_type' => 'application/pdf',
            'size' => 1000,
        ]);
    }

    private function nationalOfficer(): User
    {
        $officer = $this->user('government');

        GovernmentProfile::create([
            'user_id' => $officer->id,
            'officer_level' => 'national',
            'is_active' => true,
        ]);

        return $officer;
    }

    public function test_proposal_document_upload_is_stored_on_the_local_disk(): void
    {
        $owner = $this->user();
        $division = $this->division();

        Storage::fake('local');

        $file = UploadedFile::fake()->create('justificatif.pdf', 100, 'application/pdf');

        $this->actingAs($owner)
            ->post('/proposals', [
                'title' => 'Proposition Test',
                'summary' => 'Résumé',
                'body' => 'Corps de la proposition détaillé.',
                'category' => 'infrastructure',
                'priority' => 'medium',
                'division_id' => $division->id,
                'documents' => [$file],
            ])
            ->assertSessionHas('success');

        $document = ProposalDocument::first();
        $this->assertNotNull($document);
        $this->assertSame('local', $document->disk);
        Storage::disk('local')->assertExists($document->path);
    }

    public function test_owner_can_download_their_proposal_document(): void
    {
        $owner = $this->user();
        $proposal = $this->proposal($owner);
        $document = $this->document($proposal);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $this->actingAs($owner)
            ->get("/proposals/{$proposal->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_scoped_government_officer_can_download(): void
    {
        $owner = $this->user();
        $proposal = $this->proposal($owner);
        $document = $this->document($proposal);

        Storage::fake('local');
        Storage::disk('local')->put($document->path, 'contenu');

        $officer = $this->nationalOfficer();

        $this->actingAs($officer)
            ->get("/proposals/{$proposal->id}/documents/{$document->id}/download")
            ->assertOk();
    }

    public function test_unrelated_user_is_forbidden(): void
    {
        $owner = $this->user();
        $proposal = $this->proposal($owner);
        $document = $this->document($proposal);

        $stranger = $this->user();

        $this->actingAs($stranger)
            ->get("/proposals/{$proposal->id}/documents/{$document->id}/download")
            ->assertForbidden();
    }

    public function test_a_document_from_another_proposal_is_refused_even_for_the_owner_of_both(): void
    {
        $owner = $this->user();
        $proposalA = $this->proposal($owner);
        $proposalB = $this->proposal($owner);

        $document = $this->document($proposalB);

        $this->actingAs($owner)
            ->get("/proposals/{$proposalA->id}/documents/{$document->id}/download")
            ->assertNotFound();
    }
}
