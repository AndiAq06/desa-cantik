<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add layer_name and data_source columns to thematic_maps table.
 * 
 * - layer_name: Display name for visualization layer (separate from data name)
 * - data_source: How the data was added ('geojson_upload' | 'manual_draw')
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (!Schema::hasColumn('thematic_maps', 'layer_name')) {
                $table->string('layer_name', 255)->nullable()->after('map_name');
            }
            if (!Schema::hasColumn('thematic_maps', 'data_source')) {
                $table->string('data_source', 50)->nullable()->after('geometry_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (Schema::hasColumn('thematic_maps', 'layer_name')) {
                $table->dropColumn('layer_name');
            }
            if (Schema::hasColumn('thematic_maps', 'data_source')) {
                $table->dropColumn('data_source');
            }
        });
    }
};
