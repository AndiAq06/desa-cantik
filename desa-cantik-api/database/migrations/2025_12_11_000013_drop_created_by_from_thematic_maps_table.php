<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop created_by column from thematic_maps table - never returned in API.
     */
    public function up(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            // Try to drop foreign key first
            try {
                $table->dropForeign(['created_by']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
            if (Schema::hasColumn('thematic_maps', 'created_by')) {
                $table->dropColumn('created_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('thematic_maps', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
