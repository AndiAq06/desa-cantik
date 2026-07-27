<?php

namespace Database\Factories;

use App\Models\ThematicMap;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThematicMap>
 */
class ThematicMapFactory extends Factory
{
    protected $model = ThematicMap::class;

    public function definition(): array
    {
        return [
            'village_id' => Village::factory(),
            'map_name' => fake()->words(3, true),
            'map_type' => fake()->randomElement(['geojson', 'manual_input']),
            'geometry_type' => fake()->randomElement(['Point', 'Polygon', 'LineString']),
            'description' => fake()->sentence(),
            'layer_config' => ['color' => fake()->safeHexColor()],
            'is_active' => true,
        ];
    }
}
