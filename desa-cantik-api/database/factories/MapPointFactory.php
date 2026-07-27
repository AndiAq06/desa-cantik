<?php

namespace Database\Factories;

use App\Models\MapPoint;
use App\Models\ThematicMap;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MapPoint>
 */
class MapPointFactory extends Factory
{
    protected $model = MapPoint::class;

    public function definition(): array
    {
        return [
            'thematic_map_id' => ThematicMap::factory(),
            'name' => fake()->streetName(),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement(['pendidikan', 'ekonomi', 'kesehatan']),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'icon_url' => fake()->imageUrl(),
            'metadata' => ['color' => fake()->safeHexColor()],
        ];
    }
}
