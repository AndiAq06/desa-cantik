<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds database-level constraints to prevent transitive redundancy:
     * - Ensures village_statistics.village_id matches the village_id of the referenced module
     * - Creates composite unique key on desa_modules(id, village_id)
     * - Creates composite foreign key from village_statistics to desa_modules
     */
    public function up(): void
    {
        // Step 1: Fix any existing inconsistent data
        // Update village_statistics to match module's village_id where they differ
        $fixed = DB::statement('
            UPDATE village_statistics vs
            INNER JOIN desa_modules dm ON vs.module_id = dm.id
            SET vs.village_id = dm.village_id
            WHERE vs.module_id IS NOT NULL
            AND vs.village_id != dm.village_id
        ');

        if ($fixed) {
            echo "Fixed inconsistent village_id in village_statistics\n";
        }

        // Step 2: Add composite unique key to desa_modules if not present. This enables
        // foreign key constraint on (id, village_id). Some DBs may already have an
        // index created (e.g. manual import), so guard against duplicate index name errors.
        $schemaName = DB::connection()->getDatabaseName();
        $existingIndex = DB::selectOne(
            'SELECT COUNT(1) cnt FROM information_schema.STATISTICS WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$schemaName, 'desa_modules', 'unique_module_village']
        );

        if (empty($existingIndex) || $existingIndex->cnt == 0) {
            Schema::table('desa_modules', function (Blueprint $table) {
                $table->unique(['id', 'village_id'], 'unique_module_village');
            });
        }

        // Step 3: Add composite foreign key constraint
        // This enforces that village_statistics.module_id + village_id must reference
        // a valid desa_modules.id + village_id pair
        Schema::table('village_statistics', function (Blueprint $table) {
            // Note: We cannot use SET NULL here because village_id is NOT NULL. Using
            // RESTRICT prevents deleting a module while statistics reference it which
            // keeps data consistent without making village_id nullable.
            $table->foreign(['module_id', 'village_id'], 'fk_village_stat_module_village')
                ->references(['id', 'village_id'])
                ->on('desa_modules')
                ->onDelete('restrict')  // Prevent deleting modules referenced by statistics
                ->onUpdate('cascade');   // If module's village changes, cascade the change
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraint
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropForeign('fk_village_stat_module_village');
        });

        // Drop composite unique key if exists (keeps migrations reversible when index was
        // pre-existing, avoiding errors in DBs where it doesn't exist)
        $schemaName = DB::connection()->getDatabaseName();
        $existingIndex = DB::selectOne(
            'SELECT COUNT(1) cnt FROM information_schema.STATISTICS WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$schemaName, 'desa_modules', 'unique_module_village']
        );

        if (!empty($existingIndex) && $existingIndex->cnt > 0) {
            // Use raw statement to ensure consistent behavior across MySQL versions
            DB::statement('ALTER TABLE `desa_modules` DROP INDEX `unique_module_village`');
        }
    }
};
