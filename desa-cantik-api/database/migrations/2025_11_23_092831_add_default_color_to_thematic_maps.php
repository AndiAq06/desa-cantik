<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Update existing thematic maps to have default color in layer_config
     */
    public function up(): void
    {
        // Get all thematic maps without layer_config or without color in layer_config
        DB::table('thematic_maps')->get()->each(function ($map) {
            $layerConfig = $map->layer_config ? json_decode($map->layer_config, true) : [];
            
            // Add default color if not present
            if (!isset($layerConfig['color'])) {
                $layerConfig['color'] = '#FF0000';
                
                DB::table('thematic_maps')
                    ->where('id', $map->id)
                    ->update(['layer_config' => json_encode($layerConfig)]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data migration
        // The color field in layer_config can remain
    }
};
