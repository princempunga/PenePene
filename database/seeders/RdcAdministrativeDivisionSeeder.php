<?php

namespace Database\Seeders;

use App\Models\AdministrativeDivision;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RdcAdministrativeDivisionSeeder extends Seeder
{
    public function run(): void
    {
        $provinces = [
            ['name' => 'Kinshasa', 'code' => 'KN'],
            ['name' => 'Kongo Central', 'code' => 'BC'],
            ['name' => 'Kwango', 'code' => 'KG'],
            ['name' => 'Kwilu', 'code' => 'KL'],
            ['name' => 'Mai-Ndombe', 'code' => 'MN'],
            ['name' => 'Équateur', 'code' => 'EQ'],
            ['name' => 'Mongala', 'code' => 'MO'],
            ['name' => 'Nord-Ubangi', 'code' => 'NU'],
            ['name' => 'Sud-Ubangi', 'code' => 'SU'],
            ['name' => 'Tshuapa', 'code' => 'TU'],
            ['name' => 'Tshopo', 'code' => 'TO'],
            ['name' => 'Bas-Uélé', 'code' => 'BU'],
            ['name' => 'Haut-Uélé', 'code' => 'HU'],
            ['name' => 'Ituri', 'code' => 'IT'],
            ['name' => 'Nord-Kivu', 'code' => 'NK'],
            ['name' => 'Sud-Kivu', 'code' => 'SK'],
            ['name' => 'Maniema', 'code' => 'MA'],
            ['name' => 'Sankuru', 'code' => 'SA'],
            ['name' => 'Kasaï', 'code' => 'KS'],
            ['name' => 'Kasaï Central', 'code' => 'KC'],
            ['name' => 'Kasaï Oriental', 'code' => 'KE'],
            ['name' => 'Lomami', 'code' => 'LO'],
            ['name' => 'Haut-Lomami', 'code' => 'HL'],
            ['name' => 'Tanganyika', 'code' => 'TA'],
            ['name' => 'Haut-Katanga', 'code' => 'HK'],
            ['name' => 'Lualaba', 'code' => 'LU'],
        ];

        foreach ($provinces as $i => $province) {
            AdministrativeDivision::firstOrCreate(
                ['slug' => Str::slug($province['name'])],
                [
                    'level'      => 'province',
                    'name'       => $province['name'],
                    'code'       => $province['code'],
                    'sort_order' => $i + 1,
                    'is_active'  => true,
                ]
            );
        }

        $this->seedKinshasa();
        $this->seedNordKivu();
    }

    private function seedKinshasa(): void
    {
        $kinshasa = AdministrativeDivision::where('slug', 'kinshasa')->first();
        if (!$kinshasa) {
            return;
        }

        $ville = AdministrativeDivision::firstOrCreate(
            ['slug' => 'kinshasa-ville'],
            [
                'parent_id'  => $kinshasa->id,
                'level'      => 'ville',
                'name'       => 'Ville de Kinshasa',
                'code'       => 'KN-V',
                'sort_order' => 1,
                'is_active'  => true,
            ]
        );

        $communes = [
            'Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu',
            'Kasa-Vubu', 'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso',
            'Lemba', 'Limete', 'Lingwala', 'Makala', 'Maluku',
            'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaba',
            'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao',
        ];

        foreach ($communes as $i => $name) {
            AdministrativeDivision::firstOrCreate(
                ['slug' => 'kinshasa-' . Str::slug($name)],
                [
                    'parent_id'  => $ville->id,
                    'level'      => 'commune',
                    'name'       => $name,
                    'code'       => 'KN-C' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                    'sort_order' => $i + 1,
                    'is_active'  => true,
                ]
            );
        }
    }

    private function seedNordKivu(): void
    {
        $nordKivu = AdministrativeDivision::where('slug', 'nord-kivu')->first();
        if (!$nordKivu) {
            return;
        }

        $villes = [
            ['name' => 'Goma', 'code' => 'NK-GO'],
            ['name' => 'Beni', 'code' => 'NK-BE'],
        ];

        foreach ($villes as $i => $ville) {
            $villeDiv = AdministrativeDivision::firstOrCreate(
                ['slug' => 'nord-kivu-' . Str::slug($ville['name'])],
                [
                    'parent_id'  => $nordKivu->id,
                    'level'      => 'ville',
                    'name'       => $ville['name'],
                    'code'       => $ville['code'],
                    'sort_order' => $i + 1,
                    'is_active'  => true,
                ]
            );

            if ($ville['name'] === 'Goma') {
                foreach (['Goma', 'Karisimbi', 'Goma-Ville'] as $j => $commune) {
                    AdministrativeDivision::firstOrCreate(
                        ['slug' => 'goma-' . Str::slug($commune)],
                        [
                            'parent_id'  => $villeDiv->id,
                            'level'      => 'commune',
                            'name'       => $commune,
                            'code'       => 'NK-GC' . ($j + 1),
                            'sort_order' => $j + 1,
                            'is_active'  => true,
                        ]
                    );
                }
            }
        }

        $territoires = ['Rutshuru', 'Masisi', 'Lubero', 'Nyiragongo'];

        foreach ($territoires as $i => $name) {
            AdministrativeDivision::firstOrCreate(
                ['slug' => 'nord-kivu-territoire-' . Str::slug($name)],
                [
                    'parent_id'  => $nordKivu->id,
                    'level'      => 'territoire',
                    'name'       => 'Territoire de ' . $name,
                    'code'       => 'NK-T' . ($i + 1),
                    'sort_order' => $i + 10,
                    'is_active'  => true,
                ]
            );
        }
    }
}
