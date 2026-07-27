<?php

namespace Database\Factories;

use App\Models\GeospatialData;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

class GeospatialDataFactory extends Factory
{
    protected $model = GeospatialData::class;

    public function definition(): array
    {
        return [
            'desa_id' => Village::factory(),
            'description' => $this->faker->randomElement([
                'Batas Wilayah Desa',
                'Titik Fasilitas Umum',
                'Jaringan Jalan',
                'Kawasan Hutan',
                'Area Pertanian',
            ]),
            'geometry_type' => $this->faker->randomElement(['Polygon', 'Point', 'LineString']),
            'geojson_data' => $this->generateGeoJSON(),
        ];
    }

    /**
     * Generate sample GeoJSON data
     */
    private function generateGeoJSON(): array
    {
        return [
            'type' => 'FeatureCollection',
            'features' => [
                [
                    'type' => 'Feature',
                    'properties' => [
                        'name' => $this->faker->words(3, true),
                    ],
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [
                            $this->faker->longitude(),
                            $this->faker->latitude(),
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Create a polygon type geospatial data
     */
    public function polygon(): static
    {
        return $this->state(function (array $attributes) {
            $baseLng = 119.90;
            $baseLat = -2.97;
            $offset = 0.02;

            return [
                'geometry_type' => 'Polygon',
                'geojson_data' => [
                    'type' => 'FeatureCollection',
                    'features' => [
                        [
                            'type' => 'Feature',
                            'properties' => [
                                'name' => $attributes['description'] ?? 'Polygon Area',
                            ],
                            'geometry' => [
                                'type' => 'Polygon',
                                'coordinates' => [
                                    [
                                        [$baseLng, $baseLat],
                                        [$baseLng + $offset, $baseLat],
                                        [$baseLng + $offset, $baseLat + $offset],
                                        [$baseLng, $baseLat + $offset],
                                        [$baseLng, $baseLat],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ];
        });
    }

    /**
     * Create a point type geospatial data
     */
    public function point(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'geometry_type' => 'Point',
                'geojson_data' => [
                    'type' => 'FeatureCollection',
                    'features' => [
                        [
                            'type' => 'Feature',
                            'properties' => [
                                'name' => $attributes['description'] ?? 'Point Location',
                            ],
                            'geometry' => [
                                'type' => 'Point',
                                'coordinates' => [119.90, -2.97],
                            ],
                        ],
                    ],
                ],
            ];
        });
    }

    /**
     * Create a linestring type geospatial data
     */
    public function linestring(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'geometry_type' => 'LineString',
                'geojson_data' => [
                    'type' => 'FeatureCollection',
                    'features' => [
                        [
                            'type' => 'Feature',
                            'properties' => [
                                'name' => $attributes['description'] ?? 'Line Feature',
                            ],
                            'geometry' => [
                                'type' => 'LineString',
                                'coordinates' => [
                                    [119.89, -2.97],
                                    [119.90, -2.98],
                                    [119.91, -2.985],
                                ],
                            ],
                        ],
                    ],
                ],
            ];
        });
    }
}
