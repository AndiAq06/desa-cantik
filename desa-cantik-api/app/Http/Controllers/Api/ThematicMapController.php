<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThematicMap;
use App\Models\Village;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ThematicMapController extends Controller
{
    /**
     * Get all thematic maps for a village (Public)
     */
    public function index($villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $maps = ThematicMap::where('village_id', $village->id)
            ->orderBy('layer_order', 'desc')
            ->get()
            ->map(function ($map) {
                $config = $map->layer_config ?? [];
                $color = $config['color'] ?? '#FF0000';
                $featuresData = $map->features ?? ['type' => 'FeatureCollection', 'features' => []];
                $pointsCount = count($featuresData['features'] ?? []);

                return [
                    'id' => $map->id,
                    'village_id' => $map->village_id,
                    'name' => $map->layer_name ?? $map->map_name,
                    'data_name' => $map->map_name,
                    'layer_name' => $map->layer_name,
                    'theme_name' => $map->layer_name ?? $map->map_name,
                    'description' => $map->description,
                    'map_type' => $map->map_type,
                    'geometry_type' => $map->geometry_type,
                    'icon' => $map->map_type,
                    'color' => $color,
                    'is_visible' => (bool) $map->is_active,
                    'is_active' => (bool) $map->is_active,
                    'layer_order' => $map->layer_order ?? 0,
                    'points_count' => $pointsCount,
                    'features' => $featuresData,
                    'created_at' => $map->created_at,
                    'updated_at' => $map->updated_at,
                    'layer_config' => $config,
                ];
            });

        return $this->success($maps);
    }

    /**
     * Get thematic map detail with points (Public)
     */
    public function show($mapId): JsonResponse
    {
        $map = ThematicMap::with(['village:id,name,village_code'])->findOrFail($mapId);

        $featuresData = $map->features ?? ['type' => 'FeatureCollection', 'features' => []];
        
        // Transform features to points format for backwards compatibility
        $points = collect($featuresData['features'] ?? [])->map(function ($feature, $index) {
            $geometry = $feature['geometry'] ?? [];
            $properties = $feature['properties'] ?? [];
            $coordinates = $geometry['coordinates'] ?? [0, 0];
            
            return [
                'id' => $properties['id'] ?? $index + 1,
                'name' => $properties['name'] ?? '',
                'description' => $properties['description'] ?? '',
                'category' => $properties['category'] ?? '',
                'latitude' => $coordinates[1] ?? 0,
                'longitude' => $coordinates[0] ?? 0,
                'image_url' => $properties['icon_url'] ?? null,
                'additional_info' => $properties['metadata'] ?? null,
            ];
        });

        return $this->success([
            'id' => $map->id,
            'village' => [
                'id' => $map->village->id,
                'name' => $map->village->name,
                'code' => $map->village->village_code,
            ],
            'theme_name' => $map->map_name,
            'name' => $map->map_name,
            'description' => $map->description,
            'map_type' => $map->map_type,
            'geometry_type' => $map->geometry_type,
            'icon' => $map->map_type,
            'is_visible' => (bool) $map->is_active,
            'is_active' => (bool) $map->is_active,
            'points' => $points,
            'features' => $featuresData,
            'created_at' => $map->created_at,
            'updated_at' => $map->updated_at,
        ]);
    }

    /**
     * Create thematic map (Auth required)
     */
    public function store(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to create thematic map for this village');
        }

        $validator = Validator::make($request->all(), [
            'theme_name' => 'required_without:name|string|max:255',
            'name' => 'required_without:theme_name|string|max:255',
            'layer_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'map_type' => 'nullable|string|max:50',
            'geometry_type' => 'nullable|string|max:50',
            'data_source' => 'nullable|string|max:50',
            'features' => 'nullable',
            'geojson_data' => 'nullable',
            'geometry' => 'nullable',
            'color' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
            'is_visible' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $mapName = $request->input('theme_name', $request->input('name'));
        $isVisible = $request->has('is_active')
            ? $request->boolean('is_active')
            : $request->boolean('is_visible', true);

        // Build layer_config with color
        $layerConfig = [];
        if ($request->has('color')) {
            $layerConfig['color'] = $request->color;
        }

        // Handle features - accept from multiple possible field names
        $features = $request->input('features') 
            ?? $request->input('geojson_data') 
            ?? $request->input('geometry');
        
        if (is_string($features)) {
            $features = json_decode($features, true);
        }

        $map = ThematicMap::create([
            'village_id' => $village->id,
            'map_name' => $mapName,
            'layer_name' => $request->layer_name,
            'description' => $request->description,
            'map_type' => $request->input('map_type', $request->input('icon', 'thematic')),
            'geometry_type' => $request->geometry_type,
            'data_source' => $request->data_source,
            'features' => $features,
            'layer_config' => !empty($layerConfig) ? $layerConfig : null,
            'is_active' => $isVisible,
        ]);

        ActivityLogger::log('create', $map, 'Menambahkan peta tematik baru');

        $config = $map->layer_config ?? [];
        $color = $config['color'] ?? '#FF0000';

        return $this->success([
            'id' => $map->id,
            'village_id' => $map->village_id,
            'name' => $map->layer_name ?? $map->map_name,
            'data_name' => $map->map_name,
            'layer_name' => $map->layer_name,
            'theme_name' => $map->layer_name ?? $map->map_name,
            'description' => $map->description,
            'map_type' => $map->map_type,
            'geometry_type' => $map->geometry_type,
            'data_source' => $map->data_source,
            'icon' => $map->map_type,
            'features' => $map->features,
            'color' => $color,
            'is_visible' => $map->is_active,
            'is_active' => $map->is_active,
        ], 'Thematic map created successfully', 201);
    }

    /**
     * Update thematic map (Auth required)
     */
    public function update(Request $request, $villageId, $mapId): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $map = ThematicMap::where('village_id', $village->id)->findOrFail($mapId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to update this thematic map');
        }

        $validator = Validator::make($request->all(), [
            'theme_name' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'layer_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'map_type' => 'nullable|string|max:50',
            'geometry_type' => 'nullable|string|max:50',
            'data_source' => 'nullable|string|max:50',
            'features' => 'nullable',
            'geojson_data' => 'nullable',
            'geometry' => 'nullable',
            'color' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
            'is_visible' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldData = $map->toArray();

        if ($request->has('name')) {
            $map->map_name = $request->name;
        }
        if ($request->has('theme_name')) {
            $map->map_name = $request->theme_name;
        }
        if ($request->has('layer_name')) {
            $map->layer_name = $request->layer_name;
        }
        if ($request->has('description')) {
            $map->description = $request->description;
        }
        if ($request->has('map_type')) {
            $map->map_type = $request->map_type;
        }
        if ($request->has('geometry_type')) {
            $map->geometry_type = $request->geometry_type;
        }
        if ($request->has('data_source')) {
            $map->data_source = $request->data_source;
        }
        if ($request->has('isVisible')) {
            $map->is_active = $request->isVisible;
        }
        if ($request->has('is_active')) {
            $map->is_active = $request->is_active;
        }
        if ($request->has('is_visible')) {
            $map->is_active = $request->is_visible;
        }

        // Handle features update
        $features = $request->input('features') 
            ?? $request->input('geojson_data') 
            ?? $request->input('geometry');
        
        if ($features !== null) {
            if (is_string($features)) {
                $features = json_decode($features, true);
            }
            $map->features = $features;
        }


        // Update layer_config with color if provided (accept both flat 'color' and nested 'layer_config.color')
        $config = $map->layer_config ?? [];
        if ($request->has('layer_config')) {
            $layerConfig = $request->layer_config;
            if (is_array($layerConfig) && isset($layerConfig['color'])) {
                $config['color'] = $layerConfig['color'];
            }
        }
        if ($request->has('color')) {
            $config['color'] = $request->color;
        }
        $map->layer_config = !empty($config) ? $config : null;

        $map->save();

        ActivityLogger::log('update', $map, 'Memperbarui peta tematik', [
            'old_data' => $oldData,
            'new_data' => $map->toArray(),
        ]);

        $config = $map->layer_config ?? [];
        $color = $config['color'] ?? '#FF0000';

        return $this->success([
            'id' => $map->id,
            'village_id' => $map->village_id,
            'name' => $map->layer_name ?? $map->map_name,
            'data_name' => $map->map_name,
            'layer_name' => $map->layer_name,
            'theme_name' => $map->layer_name ?? $map->map_name,
            'description' => $map->description,
            'map_type' => $map->map_type,
            'geometry_type' => $map->geometry_type,
            'data_source' => $map->data_source,
            'icon' => $map->map_type,
            'features' => $map->features,
            'color' => $color,
            'is_visible' => $map->is_active,
            'is_active' => $map->is_active,
        ], 'Thematic map updated successfully');
    }

    /**
     * Delete thematic map (Auth required)
     */
    public function destroy(Request $request, $villageId, $mapId): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $map = ThematicMap::where('village_id', $village->id)->findOrFail($mapId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to delete this thematic map');
        }

        ActivityLogger::log('delete', $map, 'Menghapus peta tematik', [
            'old_data' => $map->toArray(),
        ]);

        // Features are stored in JSON column, no need to cascade delete
        $map->delete();

        return $this->success(null, 'Thematic map deleted successfully');
    }

    /**
     * Reorder layers (Auth required)
     */
    public function reorder(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to reorder layers for this village');
        }

        $validator = Validator::make($request->all(), [
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer',
            'orders.*.layer_order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        foreach ($request->orders as $order) {
            ThematicMap::where('id', $order['id'])
                ->where('village_id', $village->id)
                ->update(['layer_order' => $order['layer_order']]);
        }

        return $this->success(null, 'Layer order updated successfully');
    }
}
