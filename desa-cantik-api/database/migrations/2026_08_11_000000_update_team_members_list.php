<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Delete Rahma Fitriani Maradi Ibrahim and Teguh Christiawan
        DB::table('team_members')
            ->whereIn('name', [
                'Rahma Fitriani Maradi Ibrahim', 
                'Rahma Fitriani Maradi', 
                'Teguh Christiawan'
            ])
            ->delete();

        // 2. Define the 7 target members with their desired values
        $members = [
            [
                'name' => 'Mansyur Madjang',
                'role' => 'Kepala BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=MM',
                'display_order' => 1,
            ],
            [
                'name' => 'Dannar Kurniawan Ajie Prasetya',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KD',
                'display_order' => 2,
            ],
            [
                'name' => 'Antonius Parupang',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KT',
                'display_order' => 3,
            ],
            [
                'name' => 'Ainur Rahma',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KR',
                'display_order' => 4,
            ],
            [
                'name' => 'A. Nabilah Ahmad',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/33A1E0/ffffff?text=NA',
                'display_order' => 5,
            ],
            [
                'name' => 'Elias Patawaran',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/33A1E0/ffffff?text=EP',
                'display_order' => 6,
            ],
            [
                'name' => 'Andi Ardiansyah Nasir',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/33A1E0/ffffff?text=AN',
                'display_order' => 7,
            ],
        ];

        foreach ($members as $member) {
            // Check if exists by name
            $exists = DB::table('team_members')
                ->where('name', $member['name'])
                ->exists();

            if ($exists) {
                // Update existing record
                DB::table('team_members')
                    ->where('name', $member['name'])
                    ->update([
                        'role' => $member['role'],
                        'photo_url' => $member['photo_url'],
                        'display_order' => $member['display_order'],
                        'is_active' => true,
                        'updated_at' => now(),
                    ]);
            } else {
                // Insert new record
                DB::table('team_members')->insert([
                    'name' => $member['name'],
                    'role' => $member['role'],
                    'photo_url' => $member['photo_url'],
                    'display_order' => $member['display_order'],
                    'is_active' => true,
                    'email' => strtolower(str_replace(' ', '.', $member['name'])) . '@example.com',
                    'phone' => '081234567890',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('team_members')
            ->whereIn('name', [
                'Mansyur Madjang',
                'A. Nabilah Ahmad',
                'Elias Patawaran',
                'Andi Ardiansyah Nasir'
            ])
            ->delete();
    }
};
