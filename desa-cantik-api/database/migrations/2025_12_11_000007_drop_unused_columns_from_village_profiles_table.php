<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused columns from village_profiles table:
     * - is_featured: Never used in frontend
     * - updated_by: Never returned in API
     */
    public function up(): void
    {
        Schema::table('village_profiles', function (Blueprint $table) {
            // Drop foreign key first if exists
            if (Schema::hasColumn('village_profiles', 'updated_by')) {
                // Try to drop foreign key (may not exist)
                try {
                    $table->dropForeign(['updated_by']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            }
            $table->dropColumn([
                'is_featured',
                'updated_by',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_profiles', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('logo_url');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('thumbnail_url');
        });
    }
};
