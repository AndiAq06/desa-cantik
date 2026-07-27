<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop uploaded_by column from geospatial_data table - never returned in API.
     */
    public function up(): void
    {
        Schema::table('geospatial_data', function (Blueprint $table) {
            // Try to drop foreign key first
            try {
                $table->dropForeign(['uploaded_by']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
            if (Schema::hasColumn('geospatial_data', 'uploaded_by')) {
                $table->dropColumn('uploaded_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('geospatial_data', function (Blueprint $table) {
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
