<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Merge geospatial_data table into thematic_maps.
 * 
 * This migration:
 * 1. Adds geometry_type column to thematic_maps
 * 2. Migrates existing geospatial_data records as new thematic_maps rows
 * 3. Copies geojson_data to features for linked thematic_maps
 * 4. Drops geospatial_data_id column and geospatial_data table
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add geometry_type column to thematic_maps
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (!Schema::hasColumn('thematic_maps', 'geometry_type')) {
                $table->string('geometry_type', 50)->nullable()->after('map_type');
            }
        });

        // Step 2: Copy geojson_data from linked geospatial_data into thematic_maps.features
        // Only for records where features is null/empty and geospatial_data_id exists
        if (Schema::hasColumn('thematic_maps', 'geospatial_data_id')) {
            DB::statement("
                UPDATE thematic_maps tm
                INNER JOIN geospatial_data gd ON gd.id = tm.geospatial_data_id
                SET 
                    tm.features = gd.geojson_data,
                    tm.geometry_type = gd.geometry_type
                WHERE tm.features IS NULL OR JSON_LENGTH(tm.features) = 0
            ");
        }

        // Step 3: Migrate standalone geospatial_data records as new thematic_maps
        if (Schema::hasTable('geospatial_data')) {
            $orphanedGeoData = DB::table('geospatial_data')
                ->whereNotIn('id', function ($query) {
                    $query->select('geospatial_data_id')
                        ->from('thematic_maps')
                        ->whereNotNull('geospatial_data_id');
                })
                ->get();

            foreach ($orphanedGeoData as $geo) {
                DB::table('thematic_maps')->insert([
                    'village_id' => $geo->village_id,
                    'map_name' => $geo->description ?: 'Data Geospatial',
                    'map_type' => 'geospatial',
                    'geometry_type' => $geo->geometry_type,
                    'description' => $geo->description,
                    'features' => $geo->geojson_data,
                    'is_active' => true,
                    'created_at' => $geo->created_at,
                    'updated_at' => $geo->updated_at,
                ]);
            }
        }

        // Step 4: Drop geospatial_data_id foreign key and column
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (Schema::hasColumn('thematic_maps', 'geospatial_data_id')) {
                // Drop foreign key if exists
                try {
                    $table->dropForeign(['geospatial_data_id']);
                } catch (\Exception $e) {
                    // FK might not exist or have different name
                }
                
                $table->dropColumn('geospatial_data_id');
            }
        });

        // Step 5: Drop geospatial_data table
        Schema::dropIfExists('geospatial_data');
    }

    public function down(): void
    {
        // Recreate geospatial_data table
        Schema::create('geospatial_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->cascadeOnDelete();
            $table->string('geometry_type', 100)->nullable();
            $table->json('geojson_data')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Re-add geospatial_data_id column to thematic_maps
        Schema::table('thematic_maps', function (Blueprint $table) {
            $table->foreignId('geospatial_data_id')
                ->nullable()
                ->after('description')
                ->constrained('geospatial_data')
                ->nullOnDelete();
        });

        // Drop geometry_type column
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (Schema::hasColumn('thematic_maps', 'geometry_type')) {
                $table->dropColumn('geometry_type');
            }
        });
    }
};
