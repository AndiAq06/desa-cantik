<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Make statistic_type_id nullable as we transition to using module_id
     * for categorizing village statistics. This allows new statistics to be
     * created without requiring a statistic_type_id.
     */
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            // Drop the existing foreign key constraint first
            $table->dropForeign(['statistic_type_id']);

            // Modify the column to be nullable
            $table->foreignId('statistic_type_id')
                ->nullable()
                ->change();

            // Re-add the foreign key constraint
            $table->foreign('statistic_type_id')
                ->references('id')
                ->on('statistic_types')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['statistic_type_id']);

            // Make it NOT NULL again (be careful - this will fail if there are null values)
            $table->foreignId('statistic_type_id')
                ->nullable(false)
                ->change();

            // Re-add the foreign key constraint
            $table->foreign('statistic_type_id')
                ->references('id')
                ->on('statistic_types')
                ->restrictOnDelete();
        });
    }
};
