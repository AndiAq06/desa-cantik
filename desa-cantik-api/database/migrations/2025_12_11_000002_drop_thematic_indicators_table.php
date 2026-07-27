<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused thematic_indicators junction table - never used by frontend.
     */
    public function up(): void
    {
        Schema::dropIfExists('thematic_indicators');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('thematic_indicators', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('thematic_map_id');
            $table->unsignedBigInteger('indicator_id');
            $table->timestamps();

            $table->unique(['thematic_map_id', 'indicator_id']);
        });
    }
};
