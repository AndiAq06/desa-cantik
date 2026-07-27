<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 1.1: Merge village_profiles columns into villages table
     */
    public function up(): void
    {
        // Step 1: Add all profile columns to villages table
        Schema::table('villages', function (Blueprint $table) {
            $table->text('deskripsi')->nullable()->after('is_visible');
            $table->text('sejarah')->nullable()->after('deskripsi');
            $table->text('visi')->nullable()->after('sejarah');
            $table->text('misi')->nullable()->after('visi');
            $table->decimal('area', 10, 2)->nullable()->after('misi');
            $table->bigInteger('population')->unsigned()->nullable()->after('area');
            $table->integer('households')->unsigned()->nullable()->after('population');
            $table->integer('male_population')->unsigned()->nullable()->after('households');
            $table->integer('female_population')->unsigned()->nullable()->after('male_population');
            $table->decimal('population_density', 10, 2)->nullable()->after('female_population');
            $table->string('address', 255)->nullable()->after('population_density');
            $table->string('phone', 50)->nullable()->after('address');
            $table->string('email', 150)->nullable()->after('phone');
            $table->string('logo_url', 500)->nullable()->after('email');
        });

        // Step 2: Migrate data from village_profiles to villages
        DB::statement('
            UPDATE villages v
            INNER JOIN village_profiles vp ON v.id = vp.village_id
            SET v.deskripsi = vp.deskripsi,
                v.sejarah = vp.sejarah,
                v.visi = vp.visi,
                v.misi = vp.misi,
                v.area = vp.area,
                v.population = vp.population,
                v.households = vp.households,
                v.male_population = vp.male_population,
                v.female_population = vp.female_population,
                v.population_density = vp.population_density,
                v.address = vp.address,
                v.phone = vp.phone,
                v.email = vp.email,
                v.logo_url = vp.logo_url
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->dropColumn([
                'deskripsi',
                'sejarah',
                'visi',
                'misi',
                'area',
                'population',
                'households',
                'male_population',
                'female_population',
                'population_density',
                'address',
                'phone',
                'email',
                'logo_url',
            ]);
        });
    }
};
