<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('map_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thematic_map_id')->constrained('thematic_maps')->cascadeOnDelete();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('icon_url', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('category', 'map_points_category_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('map_points');
    }
};
