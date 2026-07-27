<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            // Check if columns exist before adding them to avoid errors if re-run
            if (!Schema::hasColumn('desa_modules', 'description')) {
                $table->text('description')->nullable()->after('module_name');
            }
            if (!Schema::hasColumn('desa_modules', 'unit')) {
                $table->string('unit', 50)->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('desa_modules', function (Blueprint $table) {
            $table->dropColumn(['description', 'unit']);
        });
    }
};
