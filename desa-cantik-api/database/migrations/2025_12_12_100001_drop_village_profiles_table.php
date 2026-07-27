<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 4: Drop village_profiles table after data migrated to villages
     */
    public function up(): void
    {
        Schema::dropIfExists('village_profiles');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot restore table without original data
        // Would need to recreate from villages table columns
    }
};
