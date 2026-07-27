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
     * - website: Not displayed or editable in frontend
     * - thumbnail_url: Replaced by logo_url with placeholder fallback
     */
    public function up(): void
    {
        Schema::table('village_profiles', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('village_profiles', 'website')) {
                $columnsToDrop[] = 'website';
            }
            if (Schema::hasColumn('village_profiles', 'thumbnail_url')) {
                $columnsToDrop[] = 'thumbnail_url';
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
        Schema::table('village_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('village_profiles', 'website')) {
                $table->string('website', 255)->nullable()->after('email');
            }
            if (!Schema::hasColumn('village_profiles', 'thumbnail_url')) {
                $table->string('thumbnail_url', 500)->nullable()->after('logo_url');
            }
        });
    }
};
