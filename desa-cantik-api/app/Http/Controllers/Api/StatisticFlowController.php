<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class StatisticFlowController extends Controller
{
    #[OA\Get(
        path: '/api/v1/statistics/validation-flow',
        summary: 'Get validation flow for statistics',
        description: 'Public endpoint describing the validation workflow for village statistics, including responsible roles and expected SLAs.',
        tags: ['Village Statistics'],
    )]
    #[OA\Response(
        response: 200,
        description: 'Validation flow retrieved successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
            ]
        )
    )]
    public function show(): JsonResponse
    {
        $steps = [
            ['id' => 'input', 'order' => 1, 'title' => 'Input Data', 'description' => 'Perangkat desa menginput data indikator dan sumber.', 'role' => 'village_officer', 'sla_days' => 2],
            ['id' => 'internal-check', 'order' => 2, 'title' => 'Validasi Internal', 'description' => 'Pemeriksaan kelengkapan dan konsistensi oleh perangkat desa.', 'role' => 'village_officer', 'sla_days' => 2],
            ['id' => 'bps-review', 'order' => 3, 'title' => 'Review BPS', 'description' => 'BPS melakukan verifikasi dan memberi catatan perbaikan.', 'role' => 'bps_admin', 'sla_days' => 3],
            ['id' => 'fix-confirm', 'order' => 4, 'title' => 'Perbaikan & Konfirmasi', 'description' => 'Perangkat desa menerapkan perbaikan sesuai catatan BPS.', 'role' => 'village_officer', 'sla_days' => 3],
            ['id' => 'publish', 'order' => 5, 'title' => 'Publikasi', 'description' => 'Data tervalidasi diterbitkan dan muncul di dashboard publik.', 'role' => 'bps_admin', 'sla_days' => 1],
        ];

        // Provide camelCase mirrors to align with frontend expectations
        $data = collect($steps)->map(fn ($step) => array_merge($step, [
            'step' => $step['order'],
            'slaDays' => $step['sla_days'],
            'roleLabel' => $step['role'] === 'bps_admin' ? 'BPS Admin' : 'Perangkat Desa',
        ]))->values();

        return $this->success($data);
    }
}
