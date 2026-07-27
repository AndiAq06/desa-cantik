<?php

namespace Database\Seeders;

use App\Models\Village;
use Illuminate\Database\Seeder;

class VillageSeeder extends Seeder
{
    public function run(): void
    {
        // Villages with denormalized profile data (merged into villages table)
        $villages = [
            [
                'id' => 1,
                'village_code' => '7316010001',
                'name' => 'Nonongan Selatan',
                'kecamatan' => 'Rantepao',
                'kabupaten' => 'Toraja Utara',
                'is_visible' => true,
                'deskripsi' => 'Desa Nonongan Selatan adalah desa binaan Desa Cantik yang memiliki kekayaan adat, budaya, serta potensi pariwisata adat Tongkonan. Desa ini menjadi lokus utama pembinaan statistik sektoral oleh BPS Kabupaten Toraja Utara.',
                'area' => 12.45,
                'population' => 8542,
                'logo_url' => '/assets/logo_sangkutu.png',
            ],
            [
                'id' => 2,
                'village_code' => '7316010002',
                'name' => 'Rindingbatu',
                'kecamatan' => 'Kesu',
                'kabupaten' => 'Toraja Utara',
                'is_visible' => true,
                'deskripsi' => 'Desa Rindingbatu merupakan kawasan percontohan pembinaan Desa Cinta Statistik dengan fokus penguatan kapasitas perangkat desa dalam penyusunan publikasi data secara mandiri.',
                'area' => 9.82,
                'population' => 6234,
                'logo_url' => '/assets/logo_desa.png',
            ]
        ];

        foreach ($villages as $villageData) {
            Village::updateOrCreate(
                ['id' => $villageData['id']],
                $villageData
            );
        }

        $this->command->info('✓ Villages seeded successfully (2 desa with denormalized profiles)');
    }
}
