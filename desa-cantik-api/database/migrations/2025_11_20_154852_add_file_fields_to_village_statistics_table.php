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
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->string('status', 50)->default('Menunggu Validasi')->after('notes');
            $table->string('file_name', 255)->nullable()->after('status');
            $table->string('file_url', 500)->nullable()->after('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('village_statistics', function (Blueprint $table) {
            $table->dropColumn(['status', 'file_name', 'file_url']);
        });
    }
};
