<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop unused file_url column from village_statistics table.
 * This column exists in the database but was never added to the model's fillable array,
 * meaning it was never written to and is always NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            if (Schema::hasColumn('village_statistics', 'file_url')) {
                $table->dropColumn('file_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->string('file_url', 500)->nullable()->after('file_name');
        });
    }
};
