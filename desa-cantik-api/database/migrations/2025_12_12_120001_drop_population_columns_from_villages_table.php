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
        Schema::table('villages', function (Blueprint $table) {
            $table->dropColumn([
                'male_population',
                'female_population',
                'population_density',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->integer('male_population')->unsigned()->nullable()->after('households');
            $table->integer('female_population')->unsigned()->nullable()->after('male_population');
            $table->decimal('population_density', 10, 2)->nullable()->after('female_population');
        });
    }
};
