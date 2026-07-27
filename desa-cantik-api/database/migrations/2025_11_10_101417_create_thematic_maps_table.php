<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thematic_maps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade');
            $table->string('map_name', 255);
            $table->string('map_type', 100)->comment('Ekonomi / Pendidikan / Kesehatan / Pariwisata / dll');
            $table->text('description')->nullable();
            $table->foreignId('geospatial_data_id')
                ->nullable()
                ->constrained('geospatial_data')
                ->nullOnDelete();
            $table->json('layer_config')->nullable()->comment('Konfigurasi layer (warna, opacity, dll)');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thematic_maps');
    }
};
