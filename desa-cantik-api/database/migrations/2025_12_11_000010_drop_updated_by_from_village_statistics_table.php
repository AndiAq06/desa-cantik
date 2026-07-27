<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop updated_by column from village_statistics table - loaded but never used.
     */
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            // Try to drop foreign key first
            try {
                $table->dropForeign(['updated_by']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
            $table->dropColumn('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->cascadeOnDelete();
        });
    }
};
