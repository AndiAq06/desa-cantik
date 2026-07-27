<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drop unused columns from villages table.
 * These columns exist in the database but have zero frontend usage:
 * - households: Never displayed in frontend
 * - address: Not used for village contact display
 * - phone: Only footer_settings.phone is used, not village.phone
 * - email: Only users.email is used, not village.email
 * - sejarah: NULL in all records, no frontend usage
 * - visi: NULL in all records, no frontend usage
 * - misi: NULL in all records, no frontend usage
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $columns = ['households', 'address', 'phone', 'email', 'sejarah', 'visi', 'misi'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('villages', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->integer('households')->unsigned()->nullable()->after('population');
            $table->string('address', 255)->nullable()->after('households');
            $table->string('phone', 50)->nullable()->after('address');
            $table->string('email', 150)->nullable()->after('phone');
            $table->text('sejarah')->nullable()->after('deskripsi');
            $table->text('visi')->nullable()->after('sejarah');
            $table->text('misi')->nullable()->after('visi');
        });
    }
};
