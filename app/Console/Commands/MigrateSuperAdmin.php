<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;

class MigrateSuperAdmin extends Command
{
    protected $signature = 'admin:migrate-super-admin';

    protected $description = "Supprime l'ancien compte josephtshim9@gmail.com puis recree le Super Admin officiel";

    public function handle(): int
    {
        $email = 'josephtshim9@gmail.com';

        try {
            $user = DB::transaction(function () use ($email) {
                // 1. Suppression reelle (forceDelete : User utilise SoftDeletes,
                // un simple delete() laisserait la ligne et violerait l'index unique)
                $deleted = User::withTrashed()->where('email', $email)->forceDelete();
                if ($deleted) {
                    $this->info("Ancien compte supprime : {$email}");
                } else {
                    $this->info("Aucun compte existant pour : {$email}");
                }

                // 2. Création du compte Super Admin officiel
                return User::create([
                    'name' => 'Super Admin',
                    'email' => $email,
                    'password' => Hash::make('Josephes6@'),
                    'phone' => '+256705507066',
                    'role' => 'super_admin',
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'locale' => 'fr',
                ]);
            });

            $this->info('✅ Super Admin (re)cree avec succes :');
            $this->table(['ID', 'Nom', 'Email', 'Rôle', 'Actif'], [
                [$user->id, $user->name, $user->email, $user->role, $user->is_active ? 'oui' : 'non'],
            ]);

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('❌ Echec de la migration : '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
