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
            ->where('name', 'Antonius Parupan')
            ->update(['name' => 'Antonius Parupang']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('team_members')
            ->where('name', 'Antonius Parupang')
            ->update(['name' => 'Antonius Parupan']);
    }
};
