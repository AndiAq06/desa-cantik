<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            if (! Schema::hasColumn('publications', 'file_path')) {
                $table->string('file_path', 500)->nullable()->after('description');
            }

            if (! Schema::hasColumn('publications', 'file_name')) {
                $table->string('file_name', 255)->nullable()->after('file_path');
            }

            if (! Schema::hasColumn('publications', 'file_type')) {
                $table->string('file_type', 50)->nullable()->after('file_name');
            }

            if (! Schema::hasColumn('publications', 'file_size_bytes')) {
                $table->unsignedBigInteger('file_size_bytes')->nullable()->after('file_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            if (Schema::hasColumn('publications', 'file_path')) {
                $table->dropColumn('file_path');
            }

            if (Schema::hasColumn('publications', 'file_name')) {
                $table->dropColumn('file_name');
            }

            if (Schema::hasColumn('publications', 'file_type')) {
                $table->dropColumn('file_type');
            }

            if (Schema::hasColumn('publications', 'file_size_bytes')) {
                $table->dropColumn('file_size_bytes');
            }
        });
    }
};
