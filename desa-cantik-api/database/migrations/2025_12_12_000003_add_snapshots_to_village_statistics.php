<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 1.3: Add snapshot columns to village_statistics for denormalized reads
     */
    public function up(): void
    {
        // Step 1: Add snapshot columns
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->string('type_name_snapshot', 255)->nullable()->after('module_id');
            $table->string('type_category_snapshot', 100)->nullable()->after('type_name_snapshot');
            $table->string('module_name_snapshot', 100)->nullable()->after('type_category_snapshot');
        });

        // Step 2: Populate snapshots from related tables for existing records
        DB::statement('
            UPDATE village_statistics vs
            LEFT JOIN statistic_types st ON vs.statistic_type_id = st.id
            LEFT JOIN desa_modules dm ON vs.module_id = dm.id
            SET vs.type_name_snapshot = st.name,
                vs.type_category_snapshot = st.category,
                vs.module_name_snapshot = dm.module_name
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropColumn([
                'type_name_snapshot',
                'type_category_snapshot',
                'module_name_snapshot',
            ]);
        });
    }
};
