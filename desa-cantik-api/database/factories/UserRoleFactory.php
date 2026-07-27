<?php

namespace Database\Factories;

use App\Models\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\UserRole>
 */
class UserRoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'role_name' => fake()->unique()->slug(),
            'display_name' => fake()->words(2, true),
            'description' => fake()->sentence(),
        ];
    }

    public function bpsAdmin(): static
    {
        return $this->state(fn () => [
            'role_name' => UserRole::BPS_ADMIN,
            'display_name' => 'BPS Admin',
        ]);
    }

    public function villageOfficer(): static
    {
        return $this->state(fn () => [
            'role_name' => UserRole::VILLAGE_OFFICER,
            'display_name' => 'Perangkat Desa',
        ]);
    }
}
