<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop data_source column from thematic_maps.
 * 
 * The data_source field is redundant - map_type is used instead
 * with values 'geojson' or 'manual_input' for the Sumber column.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (Schema::hasColumn('thematic_maps', 'data_source')) {
                $table->dropColumn('data_source');
            }
        });
    }

    public function down(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (!Schema::hasColumn('thematic_maps', 'data_source')) {
                $table->string('data_source', 50)->nullable()->after('geometry_type');
            }
        });
    }
};
