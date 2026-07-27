<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 4: Drop roles table after conversion to enum
     */
    public function up(): void
    {
        Schema::dropIfExists('roles');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot restore table without original data
        // Would need seeder to recreate roles data
    }
};
