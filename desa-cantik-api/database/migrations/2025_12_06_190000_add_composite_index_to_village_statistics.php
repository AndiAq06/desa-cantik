<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add composite index for common statistics query patterns.
     * Optimizes: WHERE village_id = ? AND year = ? ORDER BY status
     */
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->index(
                ['village_id', 'year', 'status'],
                'village_statistics_village_year_status_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropIndex('village_statistics_village_year_status_idx');
        });
    }
};
