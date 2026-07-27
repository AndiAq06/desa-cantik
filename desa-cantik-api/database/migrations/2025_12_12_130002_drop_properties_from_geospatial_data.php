<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop unused properties column from geospatial_data table.
 * This column exists in the database but was never added to the model's fillable array,
 * meaning it was never written to and is always NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('geospatial_data', function (Blueprint $table) {
            if (Schema::hasColumn('geospatial_data', 'properties')) {
                $table->dropColumn('properties');
            }
        });
    }

    public function down(): void
    {
        Schema::table('geospatial_data', function (Blueprint $table) {
            $table->json('properties')->nullable()->after('description');
        });
    }
};
