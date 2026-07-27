<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\User;
use App\Models\Village;
use App\Models\VillageStatistic;
use Illuminate\Database\Seeder;

class VillageStatisticSeeder extends Seeder
{
    /**
     * Jalankan seeding basis data.
     * 
     * Note: statistic_type_id removed - now using module_id from desa_modules table
     */
    public function run(): void
    {
        // Seeding stats bypassed to keep indicators empty initially as requested
        $this->command->info('✓ Seeding stats bypassed to keep indicators empty');
    }
}
