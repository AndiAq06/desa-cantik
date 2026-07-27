<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThematicMap extends Model
{
    use HasFactory;

    protected $table = 'thematic_maps';

    protected $fillable = [
        'village_id',
        'map_name',
        'layer_name',
        'map_type',
        'geometry_type',
        'description',
        'layer_config',
        'features', // GeoJSON FeatureCollection of map points
        'is_active',
        'layer_order',
    ];

    protected $casts = [
        'layer_config' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    /**
     * Get geometry data from features
     * Returns the raw GeoJSON geometry for this map
     */
    public function getGeometry(): ?array
    {
        return $this->features;
    }

    /**
     * Get features as GeoJSON FeatureCollection
     * Returns empty collection if no features exist
     */
    public function getFeatureCollection(): array
    {
        return $this->features ?? [
            'type' => 'FeatureCollection',
            'features' => [],
        ];
    }

    /**
     * Add a point feature to the map
     */
    public function addPointFeature(float $longitude, float $latitude, array $properties = []): void
    {
        $features = $this->features ?? ['type' => 'FeatureCollection', 'features' => []];
        
        $features['features'][] = [
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [$longitude, $latitude],
            ],
            'properties' => $properties,
        ];

        $this->features = $features;
    }
}
