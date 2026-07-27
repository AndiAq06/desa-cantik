<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop legacy indicators table - completely unused, replaced by statistic_types.
     */
    public function up(): void
    {
        Schema::dropIfExists('indicators');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->string('indicator_name', 255);
            $table->string('indicator_code', 50)->unique();
            $table->string('category', 100)->index();
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
};
