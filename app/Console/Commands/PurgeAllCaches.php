<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PurgeAllCaches extends Command
{
    protected $signature = 'app:purge-all-caches
                            {--dry-run : Afficher les fichiers orphelins sans les supprimer}
                            {--skip-orphans : Ne pas traiter les fichiers orphelins}';

    protected $description = 'Purge complète et irréversible de tous les caches (Laravel, OPcache) + nettoyage des fichiers orphelins de storage/app/public';

    public function handle(): int
    {
        // ------------------------------------------------------------------
        // 1. Caches Laravel
        // ------------------------------------------------------------------
        $this->info('=== Purge des caches Laravel ===');

        foreach ([
            'cache:clear' => 'Cache applicatif',
            'config:clear' => 'Cache de configuration',
            'route:clear' => 'Cache des routes',
            'view:clear' => 'Cache des vues Blade',
            'event:clear' => 'Cache des événements',
        ] as $command => $label) {
            $exit = Artisan::call($command);
            $this->line(sprintf('  [%s] %s (%s)', $exit === 0 ? 'OK' : 'ÉCHEC', $label, $command));
            $this->line('  '.trim(Artisan::output()));
        }

        // ------------------------------------------------------------------
        // 2. OPcache (CLI + FPM si possible)
        // ------------------------------------------------------------------
        $this->info('=== OPcache ===');

        if (function_exists('opcache_reset')) {
            if (opcache_reset()) {
                $this->line('  [OK] opcache_reset() — cache OPcache du process CLI réinitialisé');
            } else {
                $this->warn('  [WARN] opcache_reset() a retourné false');
            }
        } else {
            $this->line('  [SKIP] OPcache non activé pour le process CLI (zend_extension=opcache)');
        }

        $fpmStatus = '/var/run/php/php8.3-fpm.sock';
        if (function_exists('fsockopen')) {
            $this->line('  ℹ️  L\'OPcache de PHP-FPM tourne dans un process séparé : exécuter aussi');
            $this->line('     sudo systemctl reload php*-fpm   (ou sudo service php8.3-fpm reload)');
        }

        // ------------------------------------------------------------------
        // 3. Lien symbolique storage
        // ------------------------------------------------------------------
        $this->info('=== Lien symbolique storage ===');

        $publicPath = public_path('storage');
        $targetPath = storage_path('app/public');

        if (is_link($publicPath) && realpath($publicPath) === realpath($targetPath)) {
            $this->line("  [OK] {$publicPath} -> {$targetPath}");
        } else {
            $this->warn('  Lien manquant ou invalide, recréation forcée...');
            if (is_dir($publicPath) && ! is_link($publicPath)) {
                // Un dossier physique occupe la place : on le vide seulement s'il est vide.
                $entries = glob($publicPath.'/*');
                if (empty($entries)) {
                    @rmdir($publicPath);
                } else {
                    $this->warn("  ATTENTION : {$publicPath} est un dossier NON VIDE (contenu copié ?). Non supprimé automatiquement.");
                }
            }
            Artisan::call('storage:link', ['--force' => true]);
            $this->line('  '.trim(Artisan::output()));
        }

        // ------------------------------------------------------------------
        // 4. Fichiers orphelins dans storage/app/public
        // ------------------------------------------------------------------
        if ($this->option('skip-orphans')) {
            $this->info('=== Fichiers orphelins : ignorés (--skip-orphans) ===');

            return self::SUCCESS;
        }

        $this->info('=== Détection des fichiers orphelins (storage/app/public) ===');

        $dryRun = (bool) $this->option('dry-run');

        // Tous les chemins référencés en base de données.
        $referenced = $this->referencedPaths();
        $this->line(sprintf('  %d chemins référencés en base de données', count($referenced)));

        $disk = Storage::disk('public');
        $allFiles = $disk->allFiles();
        $this->line(sprintf('  %d fichiers physiques trouvés sur le disque', count($allFiles)));

        $orphans = [];
        foreach ($allFiles as $path) {
            if ($this->isReferenced($path, $referenced)) {
                continue;
            }
            $orphans[] = $path;
        }

        if (empty($orphans)) {
            $this->info('  Aucun fichier orphelin détecté. ✔');

            return self::SUCCESS;
        }

        $this->line(sprintf('  %d fichier(s) orphelin(s) :', count($orphans)));
        foreach ($orphans as $path) {
            $size = $disk->size($path);
            $this->line(sprintf('    - %s (%s)', $path, $this->formatBytes($size)));
        }

        if ($dryRun) {
            $this->warn('  --dry-run : aucune suppression effectuée.');

            return self::SUCCESS;
        }

        if (! $this->confirm('Supprimer définitivement ces fichiers ? (irréversible)', false)) {
            $this->line('  Suppression annulée.');

            return self::SUCCESS;
        }

        $deleted = 0;
        $freed = 0;
        foreach ($orphans as $path) {
            if ($disk->delete($path)) {
                $deleted++;
                $freed += $disk->size($path);
            } else {
                $this->warn("  Impossible de supprimer : {$path}");
            }
        }

        $this->info(sprintf('  %d fichier(s) supprimé(s), %s libérés.', $deleted, $this->formatBytes($freed)));

        // Nettoyage des répertoires vides résiduels.
        $this->removeEmptyDirectories(storage_path('app/public'));

        return self::SUCCESS;
    }

    /**
     * Chemins référencés en base (ProductImage.image_path, categories.image,
     * sellers logo/banner, avatars, attachments de chat, documents, etc.).
     */
    private function referencedPaths(): array
    {
        $paths = [];

        $queries = [
            ['product_images', 'image_path'],
            ['categories', 'image'],
            ['subcategories', 'image'],
            ['sellers', 'logo'],
            ['sellers', 'banner'],
            ['users', 'avatar'],
            ['chat_messages', 'attachment_path'],
            ['products', 'image'],
        ];

        foreach ($queries as [$table, $column]) {
            try {
                $rows = DB::table($table)
                    ->whereNotNull($column)
                    ->where($column, '!=', '')
                    ->pluck($column);

                foreach ($rows as $value) {
                    foreach ($this->normalizeCandidates($value) as $candidate) {
                        $paths[$candidate] = true;
                    }
                }
            } catch (\Throwable $e) {
                // Table ou colonne inexistante : on ignore silencieusement.
                $this->line(sprintf('  (table ignorée : %s.%s)', $table, $column));
            }
        }

        return $paths;
    }

    /**
     * Génère les variantes normalisées d'un chemin stocké en base
     * ("/storage/x.jpg", "x.jpg", "images/x.jpg", "/images/x.jpg", URL complète...).
     */
    private function normalizeCandidates(string $value): array
    {
        $candidates = [];

        $value = parse_url(trim($value), PHP_URL_PATH) ?: $value; // retire le domaine des URL absolues
        $value = ltrim($value, '/');

        // Retire les préfixes publics courants.
        foreach (['storage/', 'public/'] as $prefix) {
            if (Str::startsWith($value, $prefix)) {
                $value = substr($value, strlen($prefix));
            }
        }

        if ($value !== '') {
            $candidates[ltrim($value, '/')] = true;
        }

        return array_keys($candidates);
    }

    /**
     * Un fichier est référencé si son chemin correspond à une entrée en base,
     * ou s'il ne fait pas partie du stockage média (fichier public statique).
     */
    private function isReferenced(string $path, array $referenced): bool
    {
        if (isset($referenced[$path])) {
            return true;
        }

        // Match direct ou relatif au dossier courant.
        $basename = basename($path);
        $dir = dirname($path);

        return isset($referenced[$dir.'/'.$basename]) || isset($referenced[$basename]);
    }

    private function removeEmptyDirectories(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (glob($dir.'/*', GLOB_ONLYDIR) ?: [] as $subDir) {
            $this->removeEmptyDirectories($subDir);
        }

        $entries = glob($dir.'/*');
        if ($entries === false || $entries === []) {
            @rmdir($dir);
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['o', 'Ko', 'Mo', 'Go'];
        $i = 0;
        $value = (float) $bytes;
        while ($value >= 1024 && $i < count($units) - 1) {
            $value /= 1024;
            $i++;
        }

        return sprintf('%.2f %s', $value, $units[$i]);
    }
}
