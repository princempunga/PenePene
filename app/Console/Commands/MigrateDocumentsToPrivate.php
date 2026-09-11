<?php

namespace App\Console\Commands;

use App\Models\SellerDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Throwable;

class MigrateDocumentsToPrivate extends Command
{
    /**
     * php artisan documents:migrate-to-private
     * php artisan documents:migrate-to-private --dry-run
     *
     * Moves existing SellerDocument files off the public disk (where they
     * were readable by anyone who guessed/leaked the URL) onto the private
     * 'local' disk (storage/app/private, never web-served).
     *
     * Safety: this command never deletes the public copy until the local
     * copy has been written AND verified (existence + matching byte size).
     * A single document failing never stops the run — every failure is
     * logged and the command moves on, so one bad row can't block the rest.
     */
    protected $signature = 'documents:migrate-to-private {--dry-run : Liste ce qui serait migré sans rien modifier}';

    protected $description = "Migre les documents vendeurs (KYC) du disque public vers le disque privé 'local'";

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $documents = SellerDocument::where('disk', 'public')
            ->orWhereNull('disk')
            ->get();

        if ($documents->isEmpty()) {
            $this->info('Aucun document sur le disque public. Rien à migrer.');

            return self::SUCCESS;
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
            $path = $document->document_file;

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

                // Le fichier est confirmé sur le disque privé : on peut
                // maintenant supprimer l'original public et mettre à jour
                // l'enregistrement en base.
                Storage::disk('public')->delete($path);
                $document->update(['disk' => 'local']);

                $migrated++;
                $this->line("  [OK] Document #{$document->id} : {$path} migré vers le disque privé.");
            } catch (Throwable $e) {
                $failed[] = "#{$document->id} ({$path}): {$e->getMessage()}";
                $this->error("  [ÉCHEC] Document #{$document->id} : {$e->getMessage()}");
                // On continue avec les documents suivants — un échec isolé
                // ne doit jamais interrompre la migration des autres.
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

        return empty($failed) ? self::SUCCESS : self::FAILURE;
    }
}
