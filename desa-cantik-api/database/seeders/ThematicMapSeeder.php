<?php

namespace Database\Seeders;

use App\Models\ThematicMap;
use App\Models\Village;
use Illuminate\Database\Seeder;

class ThematicMapSeeder extends Seeder
{
    /**
     * Seed thematic maps with embedded GeoJSON features.
     * 
     * Note: geospatial_data has been merged into thematic_maps.
     * Features are now stored directly in the 'features' JSON column.
     */
    public function run(): void
    {
        $villages = Village::all();

        if ($villages->isEmpty()) {
            $this->command->warn('No villages found. Please run VillageSeeder first.');
            return;
        }

        foreach ($villages as $village) {
            $maps = [
                [
                    'village_id' => $village->id,
                    'map_name' => 'Batas Wilayah Desa',
                    'map_type' => 'geojson',
                    'geometry_type' => 'Polygon',
                    'description' => 'Batas administratif wilayah desa',
                    'features' => [
                        'type' => 'FeatureCollection',
                        'features' => [
                            [
                                'type' => 'Feature',
                                'properties' => [
                                    'name' => 'Batas Desa',
                                    'color' => '#FF0000',
                                ],
                                'geometry' => [
                                    'type' => 'Polygon',
                                    'coordinates' => [
                                        [
                                            [119.89, -2.98],
                                            [119.91, -2.98],
                                            [119.91, -2.96],
                                            [119.89, -2.96],
                                            [119.89, -2.98],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'layer_config' => [
                        'color' => '#FF0000',
                        'opacity' => 0.5,
                    ],
                    'is_active' => true,
                ],
                [
                    'village_id' => $village->id,
                    'map_name' => 'Peta Sebaran Sekolah',
                    'map_type' => 'geojson',
                    'geometry_type' => 'Point',
                    'description' => 'Lokasi sekolah dan fasilitas pendidikan',
                    'features' => [
                        'type' => 'FeatureCollection',
                        'features' => [
                            [
                                'type' => 'Feature',
                                'properties' => [
                                    'name' => 'SD Negeri 1',
                                    'type' => 'Sekolah Dasar',
                                ],
                                'geometry' => [
                                    'type' => 'Point',
                                    'coordinates' => [119.90, -2.97],
                                ],
                            ],
                            [
                                'type' => 'Feature',
                                'properties' => [
                                    'name' => 'SMP Negeri 1',
                                    'type' => 'Sekolah Menengah Pertama',
                                ],
                                'geometry' => [
                                    'type' => 'Point',
                                    'coordinates' => [119.905, -2.972],
                                ],
                            ],
                        ],
                    ],
                    'layer_config' => [
                        'color' => '#0000FF',
                        'opacity' => 1.0,
                    ],
                    'is_active' => true,
                ],
                [
                    'village_id' => $village->id,
                    'map_name' => 'Peta Potensi Perairan',
                    'map_type' => 'manual_input',
                    'geometry_type' => 'LineString',
                    'description' => 'Jalur aliran sungai utama',
                    'features' => [
                        'type' => 'FeatureCollection',
                        'features' => [
                            [
                                'type' => 'Feature',
                                'properties' => [
                                    'name' => 'Sungai Utama',
                                    'width' => 10,
                                ],
                                'geometry' => [
                                    'type' => 'LineString',
                                    'coordinates' => [
                                        [119.89, -2.97],
                                        [119.895, -2.975],
                                        [119.90, -2.98],
                                        [119.91, -2.985],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'layer_config' => [
                        'color' => '#00FF00',
                        'opacity' => 0.8,
                    ],
                    'is_active' => true,
                ],
                [
                    'village_id' => $village->id,
                    'map_name' => 'Peta Kepadatan Penduduk',
                    'map_type' => 'geojson',
                    'geometry_type' => 'Polygon',
                    'description' => 'Visualisasi kepadatan penduduk per wilayah',
                    'features' => [
                        'type' => 'FeatureCollection',
                        'features' => [
                            [
                                'type' => 'Feature',
                                'properties' => [
                                    'name' => 'Area Kepadatan Tinggi',
                                    'density' => 'high',
                                ],
                                'geometry' => [
                                    'type' => 'Polygon',
                                    'coordinates' => [
                                        [
                                            [119.895, -2.975],
                                            [119.905, -2.975],
                                            [119.905, -2.965],
                                            [119.895, -2.965],
                                            [119.895, -2.975],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'layer_config' => [
                        'color' => '#FF6600',
                        'opacity' => 0.5,
                        'legend' => [
                            'title' => 'Kepadatan',
                            'items' => [['label' => 'Tinggi', 'color' => '#FF0000']],
                        ],
                    ],
                    'is_active' => true,
                ],
            ];

            foreach ($maps as $mapData) {
                ThematicMap::updateOrCreate(
                    [
                        'village_id' => $mapData['village_id'],
                        'map_name' => $mapData['map_name'],
                    ],
                    $mapData
                );
            }
        }

        $this->command->info('✓ Thematic maps seeded successfully (includes geospatial data)');
    }
}
