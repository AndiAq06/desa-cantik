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
        Schema::create('village_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->cascadeOnDelete();
            $table->foreignId('statistic_type_id')->constrained('statistic_types')->restrictOnDelete();
            $table->string('indicator_name', 255);
            $table->decimal('value', 20, 4);
            $table->string('unit', 50)->nullable();
            $table->year('year');
            $table->string('period', 50)->nullable();
            $table->string('source', 255)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('village_id', 'village_statistics_village_id_index');
            $table->index('statistic_type_id', 'village_statistics_stat_type_index');
            $table->index('year', 'village_statistics_year_index');
            $table->index('created_by', 'village_statistics_created_by_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('village_statistics');
    }
};
