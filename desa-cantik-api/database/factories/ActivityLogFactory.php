<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'village_id' => Village::factory(),
            'action' => fake()->randomElement(['create', 'update', 'delete']),
            'model_type' => 'App\\Models\\VillageStatistic',
            'model_id' => fake()->numberBetween(1, 100),
            'description' => fake()->sentence(),
            'old_data' => null,
            'new_data' => null,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
