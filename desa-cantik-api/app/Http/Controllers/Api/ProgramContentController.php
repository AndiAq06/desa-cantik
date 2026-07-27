<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProgramContentController extends Controller
{
    #[OA\Get(
        path: '/api/v1/program/content',
        summary: 'Get program content (team, SK, about)',
        description: 'Public endpoint that provides program-level content such as team members, SK download URL, and about/hero copy for the landing page.',
        tags: ['Program'],
    )]
    #[OA\Response(
        response: 200,
        description: 'Program content retrieved successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(
                    property: 'data',
                    type: 'object',
                    properties: [
                        new OA\Property(
                            property: 'about',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'title', type: 'string', example: 'Desa Cantik'),
                                new OA\Property(property: 'subtitle', type: 'string'),
                            ]
                        ),
                        new OA\Property(property: 'managers', type: 'array', items: new OA\Items(type: 'object')),
                        new OA\Property(property: 'sk', type: 'object'),
                    ]
                ),
            ]
        )
    )]
    public function show(): JsonResponse
    {
        // This is intentionally static for now; can be swapped to DB-driven content later.
        $baseUrl = config('app.url');

        return $this->success([
            'about' => [
                'title' => 'Desa Cantik',
                'subtitle' => 'Program pembinaan BPS untuk meningkatkan kualitas data statistik desa.',
            ],
            'managers' => [
                ['name' => 'Pengelola 1', 'role' => 'Koordinator Program', 'photoUrl' => null],
                ['name' => 'Pengelola 2', 'role' => 'Fasilitator Lapangan', 'photoUrl' => null],
                ['name' => 'Pengelola 3', 'role' => 'Analis Data', 'photoUrl' => null],
            ],
            'sk' => [
                'title' => 'Surat Keputusan Desa Cantik',
                'number' => 'BPS-001/DSC/2024',
                'year' => 2024,
                'url' => $baseUrl ? $baseUrl.'/storage/program/sk-desa-cantik.pdf' : null,
            ],
        ]);
    }
}
