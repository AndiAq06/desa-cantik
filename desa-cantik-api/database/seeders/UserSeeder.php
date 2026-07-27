<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Memulai seeding pengguna...');

        // ===== BUAT PENGGUNA ADMIN BPS =====
        if (! User::where('email', 'admin@bps.go.id')->exists()) {
            User::create([
                'username' => 'bps_admin',
                'email' => 'admin@bps.go.id',
                'password' => Hash::make('password123'),
                'full_name' => 'Administrator BPS Toraja Utara',
                'role' => UserRole::BPS_ADMIN->value,
                'village_id' => null,
            ]);
            $this->command->info('✓ Pengguna Admin BPS dibuat: admin@bps.go.id / password123');
        }

        // ===== BUAT PENGGUNA PERANGKAT DESA =====
        $villages = Village::all();

        if ($villages->count() > 0) {
            $nonongan = $villages->firstWhere('name', 'Nonongan Selatan');

            if ($nonongan && ! User::where('email', 'nonongan@desacantik.id')->exists()) {
                User::create([
                    'username' => 'perangkat_nonongan',
                    'email' => 'nonongan@desacantik.id',
                    'password' => Hash::make('password123'),
                    'full_name' => 'Perangkat Desa Nonongan Selatan',
                    'role' => UserRole::VILLAGE_OFFICER->value,
                    'village_id' => $nonongan->id,
                ]);
                $this->command->info('✓ Perangkat Desa dibuat: nonongan@desacantik.id / password123');
            }

            $rindingbatu = $villages->firstWhere('name', 'Rindingbatu');

            if ($rindingbatu && ! User::where('email', 'rindingbatu@desacantik.id')->exists()) {
                User::create([
                    'username' => 'perangkat_rindingbatu',
                    'email' => 'rindingbatu@desacantik.id',
                    'password' => Hash::make('password123'),
                    'full_name' => 'Perangkat Desa Rindingbatu',
                    'role' => UserRole::VILLAGE_OFFICER->value,
                    'village_id' => $rindingbatu->id,
                ]);
                $this->command->info('✓ Village Officer created: rindingbatu@desacantik.id / password123');
            }
        } else {
            $this->command->warn('No villages found. Skipping officer creation.');
        }
    }
}
