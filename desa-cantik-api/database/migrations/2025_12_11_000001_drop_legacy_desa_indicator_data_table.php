<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop legacy desa_indicator_data table - completely unused, replaced by village_statistics.
     */
    public function up(): void
    {
        Schema::dropIfExists('desa_indicator_data');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: indicators table must exist for foreign key
        Schema::create('desa_indicator_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->cascadeOnDelete();
            $table->unsignedBigInteger('indicator_id'); // Cannot restore FK if indicators table doesn't exist
            $table->decimal('value', 20, 4);
            $table->string('unit', 50)->nullable();
            $table->year('year');
            $table->string('period', 50)->nullable();
            $table->string('source', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['village_id', 'indicator_id', 'year']);
        });
    }
};
