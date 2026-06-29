<?php

namespace Database\Seeders;

use App\Models\AdministrativeDivision;
use App\Models\GovernmentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GovernmentUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RdcAdministrativeDivisionSeeder::class);

        $gombe = AdministrativeDivision::where('slug', 'kinshasa-gombe')->first();
        $kinshasa = AdministrativeDivision::where('slug', 'kinshasa')->first();
        $national = null;

        $officers = [
            [
                'email'         => 'commune@rdc.gov.cd',
                'name'          => 'Agent Commune Gombe',
                'officer_level' => 'commune',
                'division_id'   => $gombe?->id,
                'title'         => 'Secrétaire de la Commune',
                'department'    => 'Commune de Gombe',
            ],
            [
                'email'         => 'ville@rdc.gov.cd',
                'name'          => 'Agent Ville Kinshasa',
                'officer_level' => 'territory',
                'division_id'   => AdministrativeDivision::where('slug', 'kinshasa-ville')->value('id'),
                'title'         => 'Coordonnateur Urbain',
                'department'    => 'Ville de Kinshasa',
            ],
            [
                'email'         => 'province@rdc.gov.cd',
                'name'          => 'Agent Province Kinshasa',
                'officer_level' => 'provincial',
                'division_id'   => $kinshasa?->id,
                'title'         => 'Directeur Provincial',
                'department'    => 'Province de Kinshasa',
            ],
            [
                'email'         => 'national@rdc.gov.cd',
                'name'          => 'Agent National',
                'officer_level' => 'national',
                'division_id'   => $national,
                'title'         => 'Conseiller National',
                'department'    => 'Primature — Cellule Projets Citoyens',
            ],
            [
                'email'         => 'expert@rdc.gov.cd',
                'name'          => 'Expert Groupe Technique',
                'officer_level' => 'national',
                'division_id'   => null,
                'title'         => 'Expert validateur',
                'department'    => 'Groupe d\'experts interministériel',
            ],
            [
                'email'         => 'tutelage@rdc.gov.cd',
                'name'          => 'Agent Tutelle Budget',
                'officer_level' => 'national',
                'division_id'   => null,
                'title'         => 'Chargé de tutelle',
                'department'    => 'Ministère du Budget — Tutelle',
            ],
        ];

        foreach ($officers as $officer) {
            $user = User::firstOrCreate(
                ['email' => $officer['email']],
                [
                    'name'              => $officer['name'],
                    'phone'             => '+243900000001',
                    'password'          => Hash::make('password'),
                    'role'              => 'government',
                    'email_verified_at' => now(),
                ]
            );

            $user->update(['role' => 'government']);

            GovernmentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'officer_level' => $officer['officer_level'],
                    'division_id'   => $officer['division_id'],
                    'title'         => $officer['title'],
                    'department'    => $officer['department'],
                    'is_active'     => true,
                ]
            );
        }
    }
}
