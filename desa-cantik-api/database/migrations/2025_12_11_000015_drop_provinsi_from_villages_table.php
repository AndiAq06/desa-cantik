<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop provinsi column from villages table - always 'Sulawesi Selatan' (hardcoded in API).
     */
    public function up(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            if (Schema::hasColumn('villages', 'provinsi')) {
                $table->dropColumn('provinsi');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            if (!Schema::hasColumn('villages', 'provinsi')) {
                $table->string('provinsi', 100)->default('Sulawesi Selatan')->after('kabupaten');
            }
        });
    }
};
