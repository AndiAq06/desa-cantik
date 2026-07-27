<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop icon_url column from map_points table - never returned in API.
     */
    public function up(): void
    {
        Schema::table('map_points', function (Blueprint $table) {
            if (Schema::hasColumn('map_points', 'icon_url')) {
                $table->dropColumn('icon_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('map_points', function (Blueprint $table) {
            $table->string('icon_url', 500)->nullable()->after('coordinates');
        });
    }
};
