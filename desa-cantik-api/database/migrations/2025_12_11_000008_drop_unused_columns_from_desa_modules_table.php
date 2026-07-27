<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused columns from desa_modules table:
     * - description: Never queried or displayed
     * - activated_at: Stored but not returned in API
     * - deactivated_at: Stored but not returned in API
     */
    public function up(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['description', 'activated_at', 'deactivated_at'] as $column) {
                if (Schema::hasColumn('desa_modules', $column)) {
                    $columnsToDrop[] = $column;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            $table->text('description')->nullable()->after('module_name');
            $table->timestamp('activated_at')->nullable()->after('is_active');
            $table->timestamp('deactivated_at')->nullable()->after('activated_at');
        });
    }
};
