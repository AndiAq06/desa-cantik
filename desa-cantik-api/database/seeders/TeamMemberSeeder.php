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
                'name' => 'Dannar Kurniawan Adjie',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KD',
                'display_order' => 1,
            ],
            [
                'name' => 'Antonius Parupang',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KT',
                'display_order' => 2,
            ],
            [
                'name' => 'Ainur Rahma',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/154D71/ffffff?text=KR',
                'display_order' => 3,
            ],
            [
                'name' => 'Teguh Christiawan',
                'role' => 'Politeknik Statistika STIS',
                'photo_url' => 'https://placehold.co/400x400/33A1E0/ffffff?text=TC',
                'display_order' => 4,
            ],
        ];

        foreach ($members as $member) {
            TeamMember::create(array_merge($member, [
                'is_active' => true,
                'email' => strtolower(str_replace(' ', '.', $member['name'])) . '@example.com',
                'phone' => '081234567890',
            ]));
        }
    }
}
