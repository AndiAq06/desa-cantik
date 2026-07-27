<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thematic_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thematic_map_id')->constrained('thematic_maps')->onDelete('cascade');
            $table->foreignId('indicator_id')->constrained('indicators')->onDelete('cascade');
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['thematic_map_id', 'indicator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thematic_indicators');
    }
};
