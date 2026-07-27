<?php

use App\Models\Module;
use App\Models\Village;
use App\Models\VillageStatistic;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds a module_id foreign key to village_statistics table
     * to link statistics data to specific statistic modules per village.
     * This enables:
     * - Dynamic subject dropdown from village modules
     * - Module status validation (only active modules can have new statistics)
     * - Public page filtering based on module active status
     */
    public function up(): void
    {
        // Step 1: Add the module_id column
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->foreignId('module_id')
                ->nullable()
                ->after('statistic_type_id')
                ->constrained('desa_modules')
                ->nullOnDelete();
        });

        // Step 2: Create default "Statistik" modules for villages that have statistics
        // and link existing statistics to them
        $villageIdsWithStats = VillageStatistic::select('village_id')
            ->distinct()
            ->pluck('village_id');

        foreach ($villageIdsWithStats as $villageId) {
            // Find or create a "Statistik" module for this village
            $module = Module::firstOrCreate(
                [
                    'village_id' => $villageId,
                    'module_name' => 'Statistik',
                ],
                [
                    'is_active' => true,
                    'activated_at' => now(),
                ]
            );

            // Link all existing statistics of this village to the module
            VillageStatistic::where('village_id', $villageId)
                ->whereNull('module_id')
                ->update(['module_id' => $module->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropColumn('module_id');
        });
    }
};
