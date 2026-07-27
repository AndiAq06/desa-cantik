<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 4: Drop map_points table after migration to thematic_maps.features JSON
     */
    public function up(): void
    {
        Schema::dropIfExists('map_points');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot restore table without original data
        // Would need to extract from thematic_maps.features JSON
    }
};
