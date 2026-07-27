<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop unused columns from village_statistics table.
 * These columns exist in the database but have zero frontend usage:
 * - period: Never displayed in frontend
 * - notes: Never displayed in frontend
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $columns = ['period', 'notes'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('village_statistics', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->string('period', 50)->nullable()->after('year');
            $table->text('notes')->nullable()->after('source');
        });
    }
};
