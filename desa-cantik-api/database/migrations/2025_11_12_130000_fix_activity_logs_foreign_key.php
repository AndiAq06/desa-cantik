<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('activity_logs')) {
            return;
        }

        Schema::table('activity_logs', function (Blueprint $table) {
            if (Schema::hasColumn('activity_logs', 'village_id')) {
                $table->dropForeign(['village_id']);
                $table->foreign('village_id')
                    ->references('id')
                    ->on('villages')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('activity_logs')) {
            return;
        }

        Schema::table('activity_logs', function (Blueprint $table) {
            if (Schema::hasColumn('activity_logs', 'village_id')) {
                $table->dropForeign(['village_id']);
                $table->foreign('village_id')
                    ->references('id')
                    ->on('villages')
                    ->nullOnDelete();
            }
        });
    }
};
