<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // RoleSeeder removed - roles are now stored as enum in users table
            // MapPointSeeder removed - map points are now in thematic_maps.features JSON
            // StatisticTypeSeeder removed - statistic_types table dropped, using desa_modules
            // GeospatialDataSeeder removed - geospatial_data merged into thematic_maps
            VillageSeeder::class,
            UserSeeder::class,
            VillageModuleSeeder::class,
            VillageStatisticSeeder::class,
            PublicationSeeder::class,
            ThematicMapSeeder::class,
            TeamMemberSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('Database seeding completed!');
        $this->command->newLine();
        $this->command->info('Test Credentials:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('Admin BPS: admin@bps.go.id / password123');
        $this->command->info('Perangkat Desa 1: nonongan@desacantik.id / password123');
        $this->command->info('Perangkat Desa 2: rindingbatu@desacantik.id / password123');
        $this->command->newLine();
        $this->command->warn('Note: Guest/public users can access public data without login');
        $this->command->newLine();
    }
}
