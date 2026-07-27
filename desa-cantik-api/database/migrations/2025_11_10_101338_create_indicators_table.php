<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->string('indicator_code', 50)->unique();
            $table->string('indicator_name', 255);
            $table->string('category', 100)->comment('Demografi / Pendidikan / Ekonomi / Kesehatan / dll');
            $table->string('unit', 50)->comment('Jiwa / Persen / Rupiah / Unit / dll');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicators');
    }
};
