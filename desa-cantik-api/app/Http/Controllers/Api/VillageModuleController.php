<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Village;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class VillageModuleController extends Controller
{
    protected function mapModule(Module $module): array
    {
        return [
            'id' => $module->id,
            'village_id' => $module->village_id,
            'name' => $module->module_name,
            'module_name' => $module->module_name,
            'description' => $module->description,
            'unit' => $module->unit,
            'is_enabled' => (bool) $module->is_active,
            'is_active' => (bool) $module->is_active,
            'created_at' => $module->created_at,
            'updated_at' => $module->updated_at,
        ];
    }

    /**
     * Get all modules for a village (BPS Admin only)
     */
    #[OA\Get(
        path: '/api/v1/villages/{village_id}/modules',
        summary: 'Get village modules',
        description: 'Returns all available modules for a village with their enabled/disabled status. Requires BPS Admin authentication.',
        security: [['sanctum' => []]],
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Modules retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/VillageModulesResponse')
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
        description: 'Village not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function index(Village $village): JsonResponse
    {
        $modules = Module::where('village_id', $village->id)
            ->orderBy('module_name')
            ->get()
            ->map(fn($module) => $this->mapModule($module));

        return $this->success($modules);
    }

    #[OA\Post(
        path: '/api/v1/villages/{village_id}/modules',
        summary: 'Create village module',
        description: 'Create a new module entry for a village (BPS Admin only).',
        security: [['sanctum' => []]],
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 100, example: 'Publikasi'),
                    new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Modul publikasi desa'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Module created successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Module created successfully'),
                new OA\Property(property: 'data', ref: '#/components/schemas/VillageModule'),
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
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Village not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 422,
        description: 'Validation error',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function store(Request $request, Village $village): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $existing = Module::where('village_id', $village->id)
            ->where('module_name', $request->name)
            ->first();

        if ($existing) {
            return $this->error('Module already exists for this village', 422);
        }

        $module = Module::create([
            'village_id' => $village->id,
            'module_name' => $request->name,
            'description' => $request->description,
            'unit' => $request->unit,
            'is_active' => true,
        ]);

        ActivityLogger::log('create', $module, 'Menambahkan modul desa');

        return $this->success($this->mapModule($module), 'Module created successfully', 201);
    }

    /**
     * Toggle module status (BPS Admin only)
     */
    #[OA\Put(
        path: '/api/v1/villages/{village_id}/modules/{module_name}/toggle',
        summary: 'Toggle village module status',
        description: 'Enables or disables a specific module for a village. Creates the module if it doesn\'t exist. BPS Admin only.',
        security: [['sanctum' => []]],
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
            new OA\Parameter(
                name: 'module_name',
                description: 'Module name (e.g., "Profil Desa", "Laporan Statistik", "Publikasi")',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string', example: 'Profil Desa')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ToggleModuleRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Module status updated successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Module status updated successfully'),
                new OA\Property(property: 'data', ref: '#/components/schemas/VillageModule'),
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
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Village not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 422,
        description: 'Validation error',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function toggle(Request $request, Village $village, $moduleParam): JsonResponse
    {
        $identifier = urldecode($moduleParam);

        $validator = Validator::make($request->all(), [
            'is_enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        if (is_numeric($identifier)) {
            $module = Module::where('village_id', $village->id)
                ->where('id', $identifier)
                ->first();

            if (! $module) {
                return $this->notFound('Module not found for this village');
            }
        } else {
            $module = Module::firstOrNew([
                'village_id' => $village->id,
                'module_name' => $identifier,
            ]);
        }

        $oldStatus = $module->is_active;
        $module->is_active = $request->is_enabled;
        $module->save();

        ActivityLogger::log('update', $module, 'Mengubah status modul desa', [
            'old_data' => ['is_active' => $oldStatus],
            'new_data' => ['is_active' => $module->is_active],
        ]);

        return $this->success($this->mapModule($module), 'Module status updated successfully');
    }

    #[OA\Put(
        path: '/api/v1/villages/{village_id}/modules/{module}',
        summary: 'Update village module',
        description: 'Update module name or description for a village (BPS Admin only).',
        security: [['sanctum' => []]],
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'module',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 100, nullable: true),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Module updated successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Module updated successfully'),
                new OA\Property(property: 'data', ref: '#/components/schemas/VillageModule'),
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
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Module not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 422,
        description: 'Validation error or duplicate module name',
        content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
    )]
    public function update(Request $request, Village $village, $module): JsonResponse
    {
        $moduleIdentifier = urldecode($module);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $moduleModel = Module::where('village_id', $village->id)
            ->where(function ($q) use ($moduleIdentifier) {
                $q->where('id', $moduleIdentifier)
                    ->orWhere('module_name', $moduleIdentifier);
            })
            ->firstOrFail();

        $oldData = $moduleModel->toArray();

        if ($request->has('name')) {
            $exists = Module::where('village_id', $village->id)
                ->where('module_name', $request->name)
                ->where('id', '!=', $moduleModel->id)
                ->exists();

            if ($exists) {
                return $this->error('Module with this name already exists for the village', 422);
            }

            $moduleModel->module_name = $request->name;
        }

        if ($request->has('description')) {
            $moduleModel->description = $request->description;
        }

        if ($request->has('unit')) {
            $moduleModel->unit = $request->unit;
        }

        $moduleModel->save();

        ActivityLogger::log('update', $moduleModel, 'Memperbarui modul desa', [
            'old_data' => $oldData,
            'new_data' => $moduleModel->toArray(),
        ]);

        return $this->success($this->mapModule($moduleModel), 'Module updated successfully');
    }

    #[OA\Delete(
        path: '/api/v1/villages/{village_id}/modules/{module}',
        summary: 'Delete village module',
        description: 'Delete a module from a village (BPS Admin only).',
        security: [['sanctum' => []]],
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(name: 'village_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'module', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Module deleted successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Module deleted successfully'),
                new OA\Property(property: 'data', type: 'null'),
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
        description: 'Forbidden - BPS Admin required',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Module not found',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    public function destroy(Village $village, $module): JsonResponse
    {
        $moduleIdentifier = urldecode($module);

        $moduleModel = Module::where('village_id', $village->id)
            ->where(function ($q) use ($moduleIdentifier) {
                $q->where('id', $moduleIdentifier)
                    ->orWhere('module_name', $moduleIdentifier);
            })
            ->firstOrFail();

        $oldData = $moduleModel->toArray();
        $moduleModel->delete();

        ActivityLogger::log('delete', $moduleModel, 'Menghapus modul desa', [
            'old_data' => $oldData,
        ]);

        return $this->success(null, 'Module deleted successfully');
    }

    /**
     * Get active statistic modules for a village (for dropdown)
     * 
     * This endpoint is used by the frontend to populate the "Subjek" dropdown
     * in the Data Statistik form. Only returns active modules.
     */
    #[OA\Get(
        path: '/api/v1/villages/{village_id}/modules/statistics',
        summary: 'Get active statistic modules',
        description: 'Returns all active statistic-type modules for a village. Used for populating the subject dropdown in statistics forms.',
        tags: ['Village Modules'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Active statistic modules retrieved successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', type: 'array', items: new OA\Items),
            ]
        )
    )]
    public function statisticModules(Village $village): JsonResponse
    {

        // Return ALL active modules for this village (not filtered by name)
        // Any active module can be used as a subject for statistics
        $modules = Module::where('village_id', $village->id)
            ->active()
            ->orderBy('module_name')
            ->get()
            ->map(fn($module) => $this->mapModule($module));

        return $this->success($modules);
    }
}

