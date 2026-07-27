<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            if (! Schema::hasColumn('desa_modules', 'description')) {
                $table->text('description')->nullable()->after('module_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            if (Schema::hasColumn('desa_modules', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
