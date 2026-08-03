<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VillageResource;
use App\Models\Publication; // <--- PENTING: Import Model Publication
use App\Models\Village;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class VillageController extends Controller
{
    #[OA\Get(
        path: '/api/v1/villages',
        summary: 'Get all villages',
        description: 'Returns a paginated list of villages with optional search and active status filters. Includes village profiles with population and area data. Publicly accessible.',
        tags: ['Villages'],
        parameters: [
            new OA\Parameter(
                name: 'page',
                description: 'Page number for pagination',
                in: 'query',
                schema: new OA\Schema(type: 'integer', default: 1, minimum: 1)
            ),
            new OA\Parameter(
                name: 'per_page',
                description: 'Number of items per page (max 100)',
                in: 'query',
                schema: new OA\Schema(type: 'integer', default: 15, maximum: 100)
            ),
            new OA\Parameter(
                name: 'search',
                description: 'Search by village name, district (kecamatan), or regency (kabupaten)',
                in: 'query',
                schema: new OA\Schema(type: 'string', example: 'Nonongan')
            ),
            new OA\Parameter(
                name: 'is_active',
                description: 'Filter by active status (use "all" to show both active and inactive)',
                in: 'query',
                schema: new OA\Schema(type: 'string', default: 'true', enum: ['true', 'false', 'all'])
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Villages retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/VillagesResponse')
    )]
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);

        $query = Village::query()
            ->select(['id', 'village_code', 'name', 'kecamatan', 'kabupaten', 'is_visible', 'deskripsi', 'area', 'population', 'logo_url', 'has_layanan_online', 'created_at', 'updated_at']);

        // Filter by active status (default true for public)
        $isVisible = $request->query('is_active', 'true');
        if ($isVisible !== 'all') {
            $query->where('is_visible', filter_var($isVisible, FILTER_VALIDATE_BOOLEAN));
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('kecamatan', 'LIKE', "%{$search}%")
                    ->orWhere('kabupaten', 'LIKE', "%{$search}%");
            });
        }

        /** @var LengthAwarePaginator $villages */
        $villages = $query->orderBy('name')->paginate($perPage);

        $data = $villages->getCollection()
            ->map(fn(Village $village) => (new VillageResource($village))->toArray($request))
            ->values();

        return $this->paginated($villages, null, $data);
    }

    #[OA\Get(
        path: '/api/v1/villages/{id}',
        summary: 'Get village detail',
        description: 'Returns detailed information about a specific village including full profile data (description, vision, mission, demographics, contact). Publicly accessible.',
        tags: ['Villages'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Village detail retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/VillageDetailResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Village not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function show($id): JsonResponse
    {
        // Profile columns are now denormalized directly on villages table
        $village = Village::findOrFail($id);

        return $this->success((new VillageResource($village, true))->toArray(request()));
    }

    #[OA\Post(
        path: '/api/v1/villages',
        tags: ['Villages'],
        summary: 'Create village (BPS Admin only)',
        security: [['sanctum' => []]],
        responses: [new OA\Response(response: 201, description: 'Village created'), new OA\Response(response: 422, description: 'Validation error')]
    )]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:villages,village_code',
            'name' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'subdistrict' => 'sometimes|string|max:255',
            'display_order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $village = Village::create([
            'village_code' => $request->code,
            'name' => $request->name,
            'kecamatan' => $request->district,
            'kabupaten' => $request->subdistrict ?? 'Toraja Utara',
            'is_visible' => true,
            'has_layanan_online' => $request->boolean('has_layanan_online', false),
        ]);

        ActivityLogger::log('create', $village, 'Menambahkan desa baru');

        return $this->success((new VillageResource($village, true))->toArray(request()), 'Village created successfully', 201);
    }

    #[OA\Put(
        path: '/api/v1/villages/{id}',
        tags: ['Villages'],
        summary: 'Update village (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Village updated'), new OA\Response(response: 404, description: 'Village not found')]
    )]
    public function update(Request $request, $id): JsonResponse
    {
        $village = Village::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:20|unique:villages,village_code,' . $id,
            'name' => 'sometimes|string|max:255',
            'district' => 'sometimes|string|max:255',
            'subdistrict' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldData = $village->toArray();

        if ($request->has('code')) {
            $village->village_code = $request->code;
        }
        if ($request->has('name')) {
            $village->name = $request->name;
        }
        if ($request->has('district')) {
            $village->kecamatan = $request->district;
        }
        if ($request->has('subdistrict')) {
            $village->kabupaten = $request->subdistrict;
        }
        if ($request->has('has_layanan_online')) {
            $village->has_layanan_online = $request->boolean('has_layanan_online');
        }

        $village->save();

        ActivityLogger::log('update', $village, 'Memperbarui data desa', [
            'old_data' => $oldData,
            'new_data' => $village->toArray(),
        ]);

        return $this->success((new VillageResource($village, true))->toArray(request()), 'Village updated successfully');
    }

    #[OA\Delete(
        path: '/api/v1/villages/{id}',
        tags: ['Villages'],
        summary: 'Delete village (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Village deleted'), new OA\Response(response: 404, description: 'Village not found')]
    )]
    public function destroy($id): JsonResponse
    {
        $village = Village::findOrFail($id);

        // Check if village has associated users
        if ($village->users()->count() > 0) {
            return $this->error('Cannot delete village with associated users', 422);
        }

        ActivityLogger::log('delete', $village, 'Menghapus desa', [
            'old_data' => $village->toArray(),
        ]);

        $village->delete();

        return $this->success(null, 'Village deleted successfully');
    }

    #[OA\Put(
        path: '/api/v1/villages/{id}/toggle-status',
        tags: ['Villages'],
        summary: 'Toggle village active status (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Status toggled')]
    )]
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $village = Village::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldStatus = $village->is_visible;
        $village->is_visible = $request->is_active;
        $village->save();

        ActivityLogger::log('update', $village, 'Mengubah status desa', [
            'old_data' => ['is_active' => $oldStatus],
            'new_data' => ['is_active' => $village->is_visible],
        ]);

        return $this->success([
            'id' => $village->id,
            'name' => $village->name,
            'is_active' => $village->is_visible,
        ], 'Village status updated successfully');
    }

    // --- START: METHOD BARU DOKUMENTASI (DIPERBAIKI) ---
    #[OA\Get(
        path: '/api/v1/villages/{id}/documentation',
        summary: 'Get village documentation',
        description: 'Returns a list of images including village profile image and publication images.',
        tags: ['Villages'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Documentation images retrieved successfully'
    )]
    public function documentation($id): JsonResponse
    {
        // Profile columns are now denormalized directly on villages table
        $village = Village::find($id);

        if (! $village) {
            return $this->notFound('Desa tidak ditemukan');
        }

        $images = [];



        // 2. Ambil Publikasi (Hanya yang berupa GAMBAR)
        // Menggunakan kolom 'village_id' dan memfilter file_type
        $publications = Publication::where('village_id', $id)
            ->where(function ($q) {
                // Filter hanya file gambar
                $q->where('file_type', 'LIKE', 'image/%')
                    ->orWhere('file_name', 'LIKE', '%.jpg')
                    ->orWhere('file_name', 'LIKE', '%.jpeg')
                    ->orWhere('file_name', 'LIKE', '%.png');
            })
            ->latest()
            ->get();

        foreach ($publications as $pub) {
            // Gunakan accessor download_url atau file_url legacy
            $imageUrl = $pub->download_url ?? $pub->file_url;

            if ($imageUrl) {
                $images[] = [
                    'id' => 'pub-' . $pub->id,
                    'type' => 'publication',
                    'title' => $pub->title,
                    'image_url' => $imageUrl,
                    'created_at' => $pub->created_at,
                    'description' => $pub->description,
                ];
            }
        }

        return $this->success($images);
    }
    // --- END: METHOD BARU DOKUMENTASI ---

    public function storeDocumentation(Request $request, $villageId): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'description' => 'nullable|string|max:255',
        ]);

        $village = Village::findOrFail($villageId);
        $user = auth()->user() ?? $request->user();

        $publicationService = app(\App\Services\PublicationService::class);
        $fileMeta = $publicationService->storeFile($request->file('image'), $village);

        $publication = Publication::create([
            'village_id' => $village->id,
            'title' => $request->input('description') ?? 'Dokumentasi Kegiatan',
            'description' => $request->input('description'),
            'category' => 'dokumentasi',
            'published_at' => now(),
            'status' => 'Terverifikasi',
            'uploaded_by' => $user->id,
            'file_path' => $fileMeta['file_path'],
            'file_name' => $fileMeta['file_name'],
            'file_type' => $fileMeta['file_type'],
            'file_size_bytes' => $fileMeta['file_size_bytes'],
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => 'pub-' . $publication->id,
                'type' => 'publication',
                'title' => $publication->title,
                'image_url' => $publication->download_url,
                'created_at' => $publication->created_at,
                'description' => $publication->description,
            ]
        ], 201);
    }

    public function destroyDocumentation($villageId, $id): JsonResponse
    {
        $cleanId = str_replace('pub-', '', $id);
        $publication = Publication::where('village_id', $villageId)->findOrFail($cleanId);

        $publicationService = app(\App\Services\PublicationService::class);
        $publicationService->deleteFile($publication->file_path);
        
        $publication->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Dokumentasi berhasil dihapus'
        ]);
    }
}
