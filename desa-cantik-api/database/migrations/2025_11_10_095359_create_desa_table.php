<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel 'villages'
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->string('village_code', 20)->unique()->nullable(); // Bahasa Inggris
            $table->string('name', 255); // Bahasa Inggris
            $table->string('kecamatan', 100);
            $table->string('kabupaten', 100);
            $table->string('provinsi', 100)->default('Sulawesi Selatan');
            // logo_url moved to village_profiles
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('villages');
    }
};
