<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add layer_order column to thematic_maps table.
 * Higher values render on top of lower values.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (!Schema::hasColumn('thematic_maps', 'layer_order')) {
                $table->integer('layer_order')->default(0)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            if (Schema::hasColumn('thematic_maps', 'layer_order')) {
                $table->dropColumn('layer_order');
            }
        });
    }
};
