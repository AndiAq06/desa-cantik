<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 2.1: Merge map_points into thematic_maps as GeoJSON FeatureCollection
     */
    public function up(): void
    {
        // Step 1: Add features JSON column to thematic_maps
        Schema::table('thematic_maps', function (Blueprint $table) {
            $table->json('features')->nullable()->after('layer_config')
                  ->comment('GeoJSON FeatureCollection of map points');
        });

        // Step 2: Convert map_points to GeoJSON FeatureCollection per thematic_map
        $maps = DB::table('thematic_maps')->get();
        
        foreach ($maps as $map) {
            $points = DB::table('map_points')
                ->where('thematic_map_id', $map->id)
                ->get();
            
            if ($points->isEmpty()) {
                continue;
            }

            $features = $points->map(function ($p) {
                return [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [(float) $p->longitude, (float) $p->latitude],
                    ],
                    'properties' => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'description' => $p->description,
                        'category' => $p->category,
                        'metadata' => json_decode($p->metadata, true),
                    ],
                ];
            })->toArray();

            DB::table('thematic_maps')
                ->where('id', $map->id)
                ->update([
                    'features' => json_encode([
                        'type' => 'FeatureCollection',
                        'features' => $features,
                    ]),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            $table->dropColumn('features');
        });
    }
};
