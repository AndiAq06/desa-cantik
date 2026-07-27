<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drop redundant snapshot columns from village_statistics table
     */
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropColumn([
                'type_name_snapshot',
                'type_category_snapshot',
                'module_name_snapshot',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->string('type_name_snapshot', 255)->nullable()->after('module_id');
            $table->string('type_category_snapshot', 100)->nullable()->after('type_name_snapshot');
            $table->string('module_name_snapshot', 100)->nullable()->after('type_category_snapshot');
        });
        
        // Note: Rollback does NOT repopulate data
        // If rollback is needed, manual data migration required
    }
};
