<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VillageStatisticResource;
use App\Models\VillageStatistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStatisticController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $statistics = VillageStatistic::query()
            ->select([
                'id',
                'village_id',
                'module_id',
                'indicator_name',
                'value',
                'unit',
                'year',
                'source',
                'status',
                'rejection_reason',
                'file_name',
                'created_by',
                'created_at',
                'updated_at',
            ])
            ->with([
                'village:id,name,village_code,kecamatan',
                'module:id,module_name,is_active',
                'creator:id,full_name',
            ])
            ->when($request->filled('village_id'), function ($query) use ($request) {
                $query->where('village_id', (int) $request->query('village_id'));
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                $query->where('year', (int) $request->query('year'));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim((string) $request->query('search'));
                $query->where(function ($nested) use ($search) {
                    $like = '%' . $search . '%';
                    $nested
                        ->where('indicator_name', 'like', $like)
                        ->orWhereHas('village', fn($villageQuery) => $villageQuery->where('name', 'like', $like))
                        ->orWhereHas('module', fn($moduleQuery) => $moduleQuery->where('module_name', 'like', $like));
                });
            })
            ->orderByDesc('year')
            ->orderBy('indicator_name')
            ->paginate($perPage)
            ->appends($request->query());

        $data = VillageStatisticResource::collection($statistics->getCollection())->resolve();

        return $this->paginated($statistics, null, $data);
    }
}
