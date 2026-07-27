<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop the statistic_types table and related column from village_statistics.
 * 
 * This migration is part of the schema consolidation effort.
 * The statistic_types functionality has been replaced by desa_modules.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Drop foreign key constraint on village_statistics.statistic_type_id
        Schema::table('village_statistics', function (Blueprint $table) {
            // Check if column exists before dropping
            if (Schema::hasColumn('village_statistics', 'statistic_type_id')) {
                // Drop foreign key first (if exists)
                try {
                    $table->dropForeign(['statistic_type_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist or have different name
                }
                
                // Drop the column
                $table->dropColumn('statistic_type_id');
            }
        });

        // Step 2: Drop the statistic_types table
        Schema::dropIfExists('statistic_types');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate statistic_types table
        Schema::create('statistic_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Re-add the column to village_statistics
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->foreignId('statistic_type_id')
                ->nullable()
                ->after('village_id')
                ->constrained('statistic_types')
                ->nullOnDelete();
        });
    }
};
