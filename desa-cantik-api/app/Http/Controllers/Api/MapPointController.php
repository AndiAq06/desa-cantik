<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MapPoint;
use App\Models\ThematicMap;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class MapPointController extends Controller
{
    /**
     * Create map point (Auth required)
     */
    #[OA\Post(
        path: '/api/v1/thematic-maps/{map_id}/points',
        summary: 'Create map point',
        description: 'Adds a new point to a thematic map. BPS Admins can add to any map, Village Officers can only add to maps in their village.',
        security: [['sanctum' => []]],
        tags: ['Map Points'],
        parameters: [
            new OA\Parameter(
                name: 'map_id',
                description: 'Thematic Map ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 7)
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/CreateMapPointRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Map point created successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/MapPointResponse')
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Forbidden - Cannot add points to maps in other villages',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'You do not have permission to add points to this thematic map'),
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Thematic map not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 422,
        description: 'Validation error',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function store(Request $request, $mapId): JsonResponse
    {
        $map = ThematicMap::with('village')->findOrFail($mapId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $map->desa_id) {
            return $this->forbidden('You do not have permission to add points to this thematic map');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'image_url' => 'nullable|url',
            'additional_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $point = MapPoint::create([
            'thematic_map_id' => $map->id,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'icon_url' => $request->image_url,
            'metadata' => $request->additional_info ?? [],
        ]);

        ActivityLogger::log('create', $point, 'Menambahkan titik pada peta', [
            'village_id' => $map->desa_id,
        ]);

        return $this->success([
            'id' => $point->id,
            'thematic_map_id' => $point->thematic_map_id,
            'name' => $point->name,
            'description' => $point->description,
            'category' => $point->category,
            'latitude' => $point->latitude,
            'longitude' => $point->longitude,
            'image_url' => $point->icon_url,
            'additional_info' => $point->metadata,
        ], 'Map point created successfully', 201);
    }

    /**
     * Update map point (Auth required)
     */
    #[OA\Put(
        path: '/api/v1/thematic-maps/{map_id}/points/{point_id}',
        summary: 'Update map point',
        description: 'Updates an existing map point. BPS Admins can update any point, Village Officers can only update points in their village maps. All fields are optional.',
        security: [['sanctum' => []]],
        tags: ['Map Points'],
        parameters: [
            new OA\Parameter(
                name: 'map_id',
                description: 'Thematic Map ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 7)
            ),
            new OA\Parameter(
                name: 'point_id',
                description: 'Map Point ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 45)
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateMapPointRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Map point updated successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/MapPointResponse')
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Forbidden - Cannot update points in other villages',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'You do not have permission to update this map point'),
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Thematic map or point not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 422,
        description: 'Validation error',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function update(Request $request, $mapId, $pointId): JsonResponse
    {
        $map = ThematicMap::findOrFail($mapId);
        $point = MapPoint::where('thematic_map_id', $map->id)->findOrFail($pointId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $map->desa_id) {
            return $this->forbidden('You do not have permission to update this map point');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'image_url' => 'nullable|url',
            'additional_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldData = $point->toArray();

        if ($request->has('name')) {
            $point->name = $request->name;
        }
        if ($request->has('description')) {
            $point->description = $request->description;
        }
        if ($request->has('category')) {
            $point->category = $request->category;
        }
        if ($request->has('latitude')) {
            $point->latitude = $request->latitude;
        }
        if ($request->has('longitude')) {
            $point->longitude = $request->longitude;
        }
        if ($request->has('image_url')) {
            $point->icon_url = $request->image_url;
        }
        if ($request->has('additional_info')) {
            $point->metadata = $request->additional_info;
        }

        $point->save();

        ActivityLogger::log('update', $point, 'Memperbarui titik pada peta', [
            'old_data' => $oldData,
            'new_data' => $point->toArray(),
            'village_id' => $map->desa_id,
        ]);

        return $this->success([
            'id' => $point->id,
            'thematic_map_id' => $point->thematic_map_id,
            'name' => $point->name,
            'description' => $point->description,
            'category' => $point->category,
            'latitude' => $point->latitude,
            'longitude' => $point->longitude,
            'image_url' => $point->icon_url,
            'additional_info' => $point->metadata,
        ], 'Map point updated successfully');
    }

    /**
     * Delete map point (Auth required)
     */
    #[OA\Delete(
        path: '/api/v1/thematic-maps/{map_id}/points/{point_id}',
        summary: 'Delete map point',
        description: 'Deletes a map point from a thematic map. BPS Admins can delete any point, Village Officers can only delete points in their village maps.',
        security: [['sanctum' => []]],
        tags: ['Map Points'],
        parameters: [
            new OA\Parameter(
                name: 'map_id',
                description: 'Thematic Map ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 7)
            ),
            new OA\Parameter(
                name: 'point_id',
                description: 'Map Point ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 45)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Map point deleted successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Map point deleted successfully'),
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Forbidden - Cannot delete points in other villages',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'You do not have permission to delete this map point'),
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Thematic map or point not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function destroy(Request $request, $mapId, $pointId): JsonResponse
    {
        $map = ThematicMap::findOrFail($mapId);
        $point = MapPoint::where('thematic_map_id', $map->id)->findOrFail($pointId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $map->desa_id) {
            return $this->forbidden('You do not have permission to delete this map point');
        }

        ActivityLogger::log('delete', $point, 'Menghapus titik pada peta', [
            'old_data' => $point->toArray(),
            'village_id' => $map->desa_id,
        ]);

        $point->delete();

        return $this->success(null, 'Map point deleted successfully');
    }

    /**
     * Upload map point image (Auth required)
     */
    public function uploadImage(Request $request, $mapId, $pointId): JsonResponse
    {
        $map = ThematicMap::findOrFail($mapId);
        $point = MapPoint::where('thematic_map_id', $map->id)->findOrFail($pointId);

        // Check authorization
        $user = $request->user();
        $userRole = $user->role?->value;

        if ($userRole === 'village_officer' && $user->village_id !== $map->desa_id) {
            return $this->forbidden('You do not have permission to update this map point');
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|file|mimes:jpeg,jpg,png|max:3072',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        // Delete old image if exists
        if ($point->icon_url && Storage::exists($point->icon_url)) {
            Storage::delete($point->icon_url);
        }

        // Store new image
        $path = $request->file('image')->store('map-points', 'public');
        $point->icon_url = Storage::url($path);
        $point->save();

        ActivityLogger::log('update', $point, 'Mengunggah gambar titik peta', [
            'village_id' => $map->desa_id,
        ]);

        return $this->success([
            'image_url' => $point->icon_url,
        ], 'Image uploaded successfully');
    }
}
