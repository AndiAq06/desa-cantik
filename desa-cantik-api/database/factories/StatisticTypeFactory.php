<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StatisticType>
 */
class StatisticTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(2),
            'code' => strtoupper(fake()->unique()->lexify('STAT????')),
            'category' => fake()->randomElement(['kependudukan', 'ekonomi', 'pendidikan', 'kesehatan']),
            'description' => fake()->sentence(),
            'display_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }
}
