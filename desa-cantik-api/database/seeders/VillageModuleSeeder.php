<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Village;
use Illuminate\Database\Seeder;

class VillageModuleSeeder extends Seeder
{
    public function run(): void
    {
        $villages = Village::all();

        // Daftar modul standar untuk setiap desa
        $defaultModules = [
            ['module_name' => 'Wilayah dan Pemerintah', 'is_active' => true],
            ['module_name' => 'Penduduk', 'is_active' => true],
            ['module_name' => 'Sosial dan Kesejahteraan Rakyat', 'is_active' => true],
            ['module_name' => 'Komunikasi', 'is_active' => true],
            ['module_name' => 'Kesehatan', 'is_active' => true],
            ['module_name' => 'Perbankan, Koperasi, dan Perdagangan', 'is_active' => true],
        ];

        foreach ($villages as $village) {
            foreach ($defaultModules as $module) {
                Module::updateOrCreate(
                    [
                        'village_id' => $village->id,
                        'module_name' => $module['module_name'], // GANTI 'nama_desa' JADI 'module_name'
                    ],
                    [
                        'is_active' => $module['is_active'],
                    ]
                );
            }
        }

        $this->command->info('✓ Village modules seeded successfully');
    }
}
