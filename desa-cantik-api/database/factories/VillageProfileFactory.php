<?php

namespace Database\Factories;

use App\Models\VillageProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VillageProfile>
 */
class VillageProfileFactory extends Factory
{
    protected $model = VillageProfile::class;

    public function definition(): array
    {
        $malePopulation = fake()->numberBetween(500, 5000);
        $femalePopulation = fake()->numberBetween(500, 5000);

        return [
            'village_id' => \App\Models\Village::factory(),
            'deskripsi' => fake()->paragraph(),
            'sejarah' => fake()->paragraph(),
            'visi' => fake()->sentence(),
            'misi' => fake()->sentence(),
            // 'foto_url' removed (deprecated), use 'thumbnail_url' or 'logo_url' instead
            'area' => fake()->randomFloat(2, 1, 100),
            'population' => $malePopulation + $femalePopulation,
            'households' => fake()->numberBetween(200, 2000),
            'male_population' => $malePopulation,
            'female_population' => $femalePopulation,
            'population_density' => fake()->randomFloat(2, 10, 300),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->url(),
            'logo_url' => fake()->imageUrl(),
            'is_featured' => false,
            'thumbnail_url' => fake()->imageUrl(),
        ];
    }
}
