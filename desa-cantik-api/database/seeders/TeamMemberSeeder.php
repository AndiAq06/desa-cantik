<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        // Clear existing members before seeding
        TeamMember::truncate();

        foreach ($members as $member) {
            TeamMember::create(array_merge($member, [
                'is_active' => true,
                'email' => strtolower(str_replace(' ', '.', $member['name'])) . '@example.com',
                'phone' => '081234567890',
            ]));
        }
    }
}
