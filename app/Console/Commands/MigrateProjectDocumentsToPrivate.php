<?php

namespace App\Console\Commands;

use App\Models\ProjectDocument;
use App\Models\ProposalDocument;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Throwable;

class MigrateProjectDocumentsToPrivate extends Command
{
    /**
     * php artisan project-documents:migrate-to-private
     * php artisan project-documents:migrate-to-private --dry-run
     *
     * Same pattern as documents:migrate-to-private (seller KYC documents),
     * applied to the two government-module tables that had the identical
     * public-disk problem: project_documents (ProjectDocument — task
     * reports, tutelage budget/invoice/justification files) and
     * proposal_documents (ProposalDocument — citizen proposal attachments).
     *
     * Safety: never deletes the public copy until the local copy has been
     * written AND verified (existence + matching byte size). A single
     * document failing never stops the run.
     */
    protected $signature = 'project-documents:migrate-to-private {--dry-run : Liste ce qui serait migré sans rien modifier}';

    protected $description = "Migre les documents de projets et de propositions du disque public vers le disque privé 'local'";

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $overallFailed = 0;

        foreach ([
            ['model' => ProjectDocument::class, 'label' => 'ProjectDocument (project_documents)'],
            ['model' => ProposalDocument::class, 'label' => 'ProposalDocument (proposal_documents)'],
        ] as $target) {
            $this->info("=== {$target['label']} ===");
            $overallFailed += $this->migrateModel($target['model'], $dryRun);
            $this->newLine();
        }

        return $overallFailed === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function migrateModel(string $modelClass, bool $dryRun): int
    {
        $documents = $modelClass::where('disk', 'public')
            ->orWhereNull('disk')
            ->get();

        if ($documents->isEmpty()) {
            $this->info('Aucun document sur le disque public. Rien à migrer.');

            return 0;
        }

        $this->info(sprintf(
            '%d document(s) trouvé(s) sur le disque public.%s',
            $documents->count(),
            $dryRun ? ' (mode --dry-run : aucune modification ne sera appliquée)' : ''
        ));

        $migrated = 0;
        $missing = [];
        $failed = [];

        foreach ($documents as $document) {
            $path = $document->path;

            if (! Storage::disk('public')->exists($path)) {
                $missing[] = "#{$document->id} ({$path})";
                $this->warn("  [MANQUANT] Document #{$document->id} : fichier introuvable sur le disque public ({$path}).");

                continue;
            }

            if ($dryRun) {
                $this->line("  [OK] Document #{$document->id} : {$path} serait migré.");
                $migrated++;

                continue;
            }

            try {
                $contents = Storage::disk('public')->get($path);
                Storage::disk('local')->put($path, $contents);

                $copiedOk = Storage::disk('local')->exists($path)
                    && Storage::disk('local')->size($path) === Storage::disk('public')->size($path);

                if (! $copiedOk) {
                    throw new \RuntimeException('La copie ne correspond pas au fichier source (taille différente ou fichier absent après copie).');
                }

                Storage::disk('public')->delete($path);
                $document->update(['disk' => 'local']);

                $migrated++;
                $this->line("  [OK] Document #{$document->id} : {$path} migré vers le disque privé.");
            } catch (Throwable $e) {
                $failed[] = "#{$document->id} ({$path}): {$e->getMessage()}";
                $this->error("  [ÉCHEC] Document #{$document->id} : {$e->getMessage()}");
                // Un échec isolé ne doit jamais interrompre la migration des autres.
            }
        }

        $this->newLine();
        $this->table(
            ['Total', 'Migrés', 'Introuvables', 'Échecs'],
            [[$documents->count(), $migrated, count($missing), count($failed)]]
        );

        if (! empty($missing)) {
            $this->warn('Documents introuvables sur le disque public : ' . implode(', ', $missing));
        }

        if (! empty($failed)) {
            $this->error('Documents en échec : ' . implode(', ', $failed));
        }

        return count($failed);
    }
}
