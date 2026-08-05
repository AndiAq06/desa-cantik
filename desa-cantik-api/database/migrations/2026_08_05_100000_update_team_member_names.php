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
        DB::table('team_members')
            ->where('name', 'Kak Dannar')
            ->update(['name' => 'Dannar Kurniawan Adjie']);

        DB::table('team_members')
            ->where('name', 'Kak Tony')
            ->update(['name' => 'Antonius Parupang']);

        DB::table('team_members')
            ->where('name', 'Kak Rahma')
            ->update(['name' => 'Ainur Rahma']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('team_members')
            ->where('name', 'Dannar Kurniawan Adjie')
            ->update(['name' => 'Kak Dannar']);

        DB::table('team_members')
            ->where('name', 'Antonius Parupang')
            ->update(['name' => 'Kak Tony']);

        DB::table('team_members')
            ->where('name', 'Ainur Rahma')
            ->update(['name' => 'Kak Rahma']);
    }
};
