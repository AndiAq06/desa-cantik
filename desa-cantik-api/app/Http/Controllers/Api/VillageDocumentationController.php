<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class VillageDocumentationController extends Controller
{
    #[OA\Get(
        path: '/api/v1/villages/{village_id}/documentation',
        summary: 'Get village documentation gallery',
        description: 'Returns gallery items (photos/covers) for a village using available profile images and publication covers.',
        tags: ['Villages'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10),
            ),
        ],
    )]
    #[OA\Response(
        response: 200,
        description: 'Documentation gallery retrieved successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
            ]
        )
    )]
    #[OA\Response(response: 404, description: 'Village not found')]
    public function index($villageId): JsonResponse
    {
        // Profile columns are now denormalized directly on villages table
        $village = Village::findOrFail($villageId);

        $items = [];



        // Publication covers as documentation items
        $publications = Publication::query()
            ->where('desa_id', $village->id)
            ->orderByDesc('published_at')
            ->limit(10)
            ->get(['id', 'title', 'file_url', 'cover_url', 'created_at']);

        foreach ($publications as $publication) {
            $items[] = [
                'id' => 'pub-' . $publication->id,
                'type' => 'image',
                'url' => $publication->cover_url
                    ?? 'https://placehold.co/800x600/e2e8f0/94a3b8?text=' . urlencode($publication->title),
                'caption' => $publication->title,
                'created_at' => optional($publication->created_at)->toISOString(),
                'fileUrl' => $publication->file_url,
            ];
        }

        if (empty($items)) {
            $items[] = [
                'id' => 'empty-' . $village->id,
                'type' => 'image',
                'url' => 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Belum+Ada+Dokumentasi',
                'caption' => 'Belum ada dokumentasi',
            ];
        }

        return $this->success($items);
    }
}
