<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop legacy columns from publications table:
     * - file_url: Migrate any existing data to file_path first
     * - file_size: Deprecated, file_size_bytes used instead
     * - category: Never queried or displayed
     */
    public function up(): void
    {
        // Step 1: Migrate file_url to file_path for any records that have file_url but no file_path
        DB::table('publications')
            ->whereNotNull('file_url')
            ->whereNull('file_path')
            ->get()
            ->each(function ($publication) {
                // Extract path from URL: http://domain/storage/publications/file.pdf -> publications/file.pdf
                $url = $publication->file_url;
                if (preg_match('#/storage/(.+)$#', $url, $matches)) {
                    DB::table('publications')
                        ->where('id', $publication->id)
                        ->update(['file_path' => $matches[1]]);
                }
            });

        // Step 2: Drop legacy columns
        Schema::table('publications', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('publications', 'file_url')) {
                $columnsToDrop[] = 'file_url';
            }
            if (Schema::hasColumn('publications', 'file_size')) {
                $columnsToDrop[] = 'file_size';
            }
            if (Schema::hasColumn('publications', 'category')) {
                $columnsToDrop[] = 'category';
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
        Schema::table('publications', function (Blueprint $table) {
            if (!Schema::hasColumn('publications', 'file_url')) {
                $table->string('file_url', 500)->nullable()->after('file_type');
            }
            if (!Schema::hasColumn('publications', 'file_size')) {
                $table->string('file_size', 20)->nullable()->after('file_url');
            }
            if (!Schema::hasColumn('publications', 'category')) {
                $table->string('category', 100)->nullable()->after('description');
            }
        });
    }
};
