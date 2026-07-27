<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused columns from statistic_types table:
     * - code: Never queried or displayed (will break publicStatisticsOverview - need to update config instead)
     * - description: Never queried or displayed
     * 
     * Note: The code column IS used by publicStatisticsOverview() in DashboardStatisticsService
     * to fetch latest statistics by code. However, the config('dashboard.public_statistics_codes')
     * is empty in default config, so this feature is effectively unused.
     * If needed in future, use statistic_type_id instead of code.
     */
    public function up(): void
    {
        Schema::table('statistic_types', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('statistic_types', 'code')) {
                $columns[] = 'code';
            }
            if (Schema::hasColumn('statistic_types', 'description')) {
                $columns[] = 'description';
            }
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('statistic_types', function (Blueprint $table) {
            if (!Schema::hasColumn('statistic_types', 'code')) {
                $table->string('code', 50)->unique()->nullable()->after('name');
            }
            if (!Schema::hasColumn('statistic_types', 'description')) {
                $table->text('description')->nullable()->after('category');
            }
        });
    }
};
