<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Exceptions\DashboardAccessDeniedException;
use App\Exceptions\InvalidDashboardRequestException;
use App\Http\Controllers\Controller;
use App\Http\Requests\VillageDashboardRequest;
use App\Services\DashboardStatisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    public function __construct(private DashboardStatisticsService $service) {}

    /**
     * Get BPS Admin Dashboard Statistics
     *
     * @throws DashboardAccessDeniedException
     */
    #[OA\Get(
        path: '/api/v1/dashboard/admin',
        summary: 'Get BPS Admin Dashboard',
        description: 'Returns comprehensive statistics for BPS administrators including village overview, user metrics, recent activities, and monthly trends. Requires BPS Admin authentication.',
        security: [['sanctum' => []]],
        tags: ['Dashboard']
    )]
    #[OA\Response(
        response: 200,
        description: 'Admin dashboard data retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/AdminDashboardResponse')
    )]
    #[OA\Response(
        response: 401,
        description: 'Unauthenticated',
        content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
    )]
    #[OA\Response(
        response: 403,
        description: 'Access denied - BPS Admin role required',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'Access denied. Required role: bps_admin. Your role: village_officer'),
            ]
        )
    )]
    public function admin(Request $request): JsonResponse
    {
        $this->authorizeRole(UserRole::BPS_ADMIN->value);

        return $this->success($this->service->getAdminDashboard());
    }

    /**
     * Get Village Officer Dashboard Statistics
     *
     * @throws DashboardAccessDeniedException
     * @throws InvalidDashboardRequestException
     */
    #[OA\Get(
        path: '/api/v1/dashboard/village',
        summary: 'Get Village Dashboard',
        description: 'Returns village-specific statistics. Village officers can only view their assigned village. BPS admins must provide village_id parameter to view any village.',
        security: [['sanctum' => []]],
        tags: ['Dashboard']
    )]
    #[OA\Parameter(
        name: 'village_id',
        description: 'Village ID (required for BPS admin, auto-detected for village officer)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer', example: 10)
    )]
    #[OA\Response(
        response: 200,
        description: 'Village dashboard data retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/VillageDashboardResponse')
    )]
    #[OA\Response(
        response: 400,
        description: 'Invalid request - village_id required for BPS admin',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'Village ID is required. Village officers can only view their assigned village, while BPS administrators must specify a village_id parameter.'),
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
        description: 'Access denied - Cannot view other villages',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'You do not have permission to view this village dashboard'),
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Village not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'Village not found'),
            ]
        )
    )]
    public function village(VillageDashboardRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            throw new DashboardAccessDeniedException('You must be authenticated to access the village dashboard');
        }

        $villageId = $request->getVillageId();

        if (! $villageId) {
            throw new InvalidDashboardRequestException(
                'Village ID is required. Village officers can only view their assigned village, '.
                    'while BPS administrators must specify a village_id parameter.'
            );
        }

        $data = $this->service->getVillageDashboard($user, $villageId);

        return $this->success($data);
    }

    /**
     * Get Public Dashboard Statistics (Landing Page)
     */
    #[OA\Get(
        path: '/api/v1/dashboard/public',
        summary: 'Get Public Dashboard',
        description: 'Returns public-facing statistics for the landing page including total villages, population, featured villages, and latest publications. No authentication required.',
        tags: ['Dashboard']
    )]
    #[OA\Response(
        response: 200,
        description: 'Public dashboard data retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/PublicDashboardResponse')
    )]
    public function public(): JsonResponse
    {
        return $this->success($this->service->getPublicDashboard());
    }

    /**
     * Authorize user has one of the specified roles
     *
     * @throws DashboardAccessDeniedException
     */
    protected function authorizeRole(string ...$roles): void
    {
        $user = auth()->user();

        if (! $user) {
            throw new DashboardAccessDeniedException('You must be authenticated to access this dashboard');
        }

        // $user->role is now a UserRole enum, use ->value for string comparison
        if (! in_array($user->role?->value, $roles, true)) {
            throw new DashboardAccessDeniedException(
                sprintf(
                    'Access denied. Required role: %s. Your role: %s',
                    implode(' or ', $roles),
                    $user->role?->value ?? 'none'
                )
            );
        }
    }
}
