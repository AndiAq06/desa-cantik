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
        // 1. Update Dannar Kurniawan Ajie Prasetya
        DB::table('team_members')
            ->whereIn('name', ['Kak Dannar', 'Dannar Kurniawan Adjie', 'Dannar Kurniawan Ajie'])
            ->update(['name' => 'Dannar Kurniawan Ajie Prasetya']);

        // 2. Update Antonius Parupan
        DB::table('team_members')
            ->whereIn('name', ['Kak Tony', 'Antonius Parupang'])
            ->update(['name' => 'Antonius Parupan']);

        // 3. Add Rahma Fitriani Maradi Ibrahim if not exists
        $exists = DB::table('team_members')
            ->where('name', 'Rahma Fitriani Maradi Ibrahim')
            ->exists();

        if (!$exists) {
            // Get max display order
            $maxOrder = DB::table('team_members')->max('display_order') ?? 0;

            DB::table('team_members')->insert([
                'name' => 'Rahma Fitriani Maradi Ibrahim',
                'role' => 'BPS Toraja Utara',
                'photo_url' => 'https://placehold.co/400x400/33A1E0/ffffff?text=RF',
                'email' => 'rahma.fitriani@example.com',
                'phone' => '081234567890',
                'display_order' => $maxOrder + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback names
        DB::table('team_members')
            ->where('name', 'Dannar Kurniawan Ajie Prasetya')
            ->update(['name' => 'Dannar Kurniawan Adjie']);

        DB::table('team_members')
            ->where('name', 'Antonius Parupan')
            ->update(['name' => 'Antonius Parupang']);

        // Delete the added member
        DB::table('team_members')
            ->where('name', 'Rahma Fitriani Maradi Ibrahim')
            ->delete();
    }
};
