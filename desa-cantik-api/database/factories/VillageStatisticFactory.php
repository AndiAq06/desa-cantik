<?php

namespace Database\Factories;

use App\Models\StatisticType;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\VillageStatistic>
 */
class VillageStatisticFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'village_id' => Village::factory(),
            'statistic_type_id' => StatisticType::factory(),
            'indicator_name' => fake()->sentence(3),
            'value' => fake()->numberBetween(10, 10000),
            'unit' => 'jiwa',
            'year' => fake()->numberBetween(2015, 2025),
            'period' => 'Tahunan',
            'source' => 'Data Internal Desa',
            'notes' => fake()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
