<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ActivityLogController extends Controller
{
    #[OA\Get(
        path: '/api/v1/activity-logs',
        summary: 'Get activity logs',
        description: 'Returns paginated list of activity logs with optional filters. Includes user and village relationships. BPS Admin only.',
        security: [['sanctum' => []]],
        tags: ['Activity Logs'],
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
                name: 'user_id',
                description: 'Filter by user ID',
                in: 'query',
                schema: new OA\Schema(type: 'integer', example: 5)
            ),
            new OA\Parameter(
                name: 'village_id',
                description: 'Filter by village ID',
                in: 'query',
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
            new OA\Parameter(
                name: 'action',
                description: 'Filter by action type',
                in: 'query',
                schema: new OA\Schema(type: 'string', enum: ['created', 'updated', 'deleted'], example: 'created')
            ),
            new OA\Parameter(
                name: 'model_type',
                description: 'Filter by model type (partial match)',
                in: 'query',
                schema: new OA\Schema(type: 'string', example: 'VillageStatistic')
            ),
            new OA\Parameter(
                name: 'from_date',
                description: 'Filter logs from this date (Y-m-d H:i:s or Y-m-d)',
                in: 'query',
                schema: new OA\Schema(type: 'string', format: 'date-time', example: '2025-01-01')
            ),
            new OA\Parameter(
                name: 'to_date',
                description: 'Filter logs until this date (Y-m-d H:i:s or Y-m-d)',
                in: 'query',
                schema: new OA\Schema(type: 'string', format: 'date-time', example: '2025-01-31')
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Activity logs retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/ActivityLogsResponse')
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);

        $query = ActivityLog::query()
            ->with(['user:id,username,full_name', 'village:id,name,code'])
            ->select([
                'id',
                'user_id',
                'village_id',
                'action',
                'model_type',
                'model_id',
                'description',
                'old_data',
                'new_data',
                'ip_address',
                'user_agent',
                'created_at',
            ]);

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->filled('village_id')) {
            $query->where('village_id', $request->query('village_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', 'LIKE', '%'.$request->query('model_type').'%');
        }

        // Support both spec's date_from/date_to and legacy from_date/to_date
        if ($request->filled('date_from') || $request->filled('from_date')) {
            $dateFrom = $request->query('date_from') ?? $request->query('from_date');
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($request->filled('date_to') || $request->filled('to_date')) {
            $dateTo = $request->query('date_to') ?? $request->query('to_date');
            $query->where('created_at', '<=', $dateTo);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return $this->paginated($logs);
    }

    #[OA\Get(
        path: '/api/v1/activity-logs/{id}',
        summary: 'Get activity log detail',
        description: 'Returns detailed information about a specific activity log including full user and village data, change tracking. BPS Admin only.',
        security: [['sanctum' => []]],
        tags: ['Activity Logs'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Activity Log ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 152)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Activity log detail retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/ActivityLogDetailResponse')
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Activity log not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function show($id): JsonResponse
    {
        $log = ActivityLog::with(['user:id,username,full_name,email', 'village:id,name,village_code,kecamatan'])
            ->findOrFail($id);

        return $this->success([
            'id' => $log->id,
            'user' => $log->user ? [
                'id' => $log->user->id,
                'username' => $log->user->username,
                'full_name' => $log->user->full_name,
                'email' => $log->user->email,
            ] : null,
            'village' => $log->village ? [
                'id' => $log->village->id,
                'name' => $log->village->name,
                'code' => $log->village->village_code,
                'district' => $log->village->kecamatan,
            ] : null,
            'action' => $log->action,
            'model_type' => $log->model_type,
            'model_id' => $log->model_id,
            'description' => $log->description,
            'old_data' => $log->old_data,
            'new_data' => $log->new_data,
            'changes' => $this->calculateChanges($log->old_data, $log->new_data),
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'created_at' => $log->created_at,
        ]);
    }

    /**
     * Export activity logs to CSV (BPS Admin only)
     */
    public function export(Request $request)
    {
        $query = ActivityLog::query()
            ->with(['user:id,username,full_name', 'village:id,name,code']);

        // Apply same filters as index
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }
        if ($request->filled('village_id')) {
            $query->where('village_id', $request->query('village_id'));
        }
        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }
        if ($request->filled('model_type')) {
            $query->where('model_type', 'LIKE', '%'.$request->query('model_type').'%');
        }
        if ($request->filled('date_from') || $request->filled('from_date')) {
            $dateFrom = $request->query('date_from') ?? $request->query('from_date');
            $query->where('created_at', '>=', $dateFrom);
        }
        if ($request->filled('date_to') || $request->filled('to_date')) {
            $dateTo = $request->query('date_to') ?? $request->query('to_date');
            $query->where('created_at', '<=', $dateTo);
        }

        $filename = 'activity-logs-'.date('Y-m-d-His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'User', 'Village', 'Action', 'Model Type', 'Model ID', 'Description', 'IP Address', 'Created At']);

            // OPTIMIZATION: Add eager loading before chunk() to prevent N+1 queries
            $query->with(['user:id,username,full_name', 'village:id,name'])
                ->orderBy('created_at', 'desc')
                ->chunk(500, function ($logs) use ($file) {
                foreach ($logs as $log) {
                    fputcsv($file, [
                        $log->id,
                        $log->user ? $log->user->username : 'N/A',
                        $log->village ? $log->village->name : 'N/A',
                        $log->action,
                        $log->model_type,
                        $log->model_id,
                        $log->description,
                        $log->ip_address,
                        $log->created_at,
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Calculate changes between old and new data
     */
    private function calculateChanges($oldData, $newData): array
    {
        if (! $oldData || ! $newData) {
            return [];
        }

        $changes = [];
        foreach ($newData as $key => $newValue) {
            $oldValue = $oldData[$key] ?? null;
            if ($oldValue !== $newValue) {
                $changes[] = [
                    'field' => $key,
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }
}
