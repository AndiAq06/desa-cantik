<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Models\TeamMember;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class TeamMemberController extends Controller
{
    #[OA\Get(
        path: '/api/v1/team-members',
        summary: 'List all team members',
        description: 'Get list of all active team members ordered by display_order. Public access.',
        tags: ['Team Members'],
        parameters: [
            new OA\Parameter(name: 'include_inactive', in: 'query', description: 'Include inactive members (admin only)', schema: new OA\Schema(type: 'boolean')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', type: 'array', items: new OA\Items),
            ])),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $query = TeamMember::query();

        // Only show active members by default for public
        // Admins can see all if include_inactive=true
        $includeInactive = $request->boolean('include_inactive', false);
        
        if (!$includeInactive || !$this->isAdmin($request)) {
            $query->active();
        }

        $members = $query->ordered()->get();

        return $this->success(TeamMemberResource::collection($members));
    }

    #[OA\Post(
        path: '/api/v1/team-members',
        summary: 'Create new team member',
        description: 'Create a new team member. Admin only.',
        security: [['sanctum' => []]],
        tags: ['Team Members'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'role'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Dr. Ahmad Subagja'),
                    new OA\Property(property: 'role', type: 'string', example: 'Koordinator Program'),
                    new OA\Property(property: 'email', type: 'string', nullable: true, example: 'ahmad@bps.go.id'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true, example: '081234567890'),
                    new OA\Property(property: 'display_order', type: 'integer', nullable: true, example: 1),
                    new OA\Property(property: 'is_active', type: 'boolean', nullable: true, example: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Team member created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - Admin only'),
        ],
    )]
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'photo' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'display_order' => 'nullable|numeric|min:0',
            'is_active' => 'nullable',
        ]);

        \Illuminate\Support\Facades\Log::info('TeamMember Store Request:', $request->all());
        \Illuminate\Support\Facades\Log::info('Files:', $request->allFiles());

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('TeamMember Validation Failed:', $validator->errors()->toArray());
            return $this->validationError($validator);
        }

        $data = $validator->validated();

        // Handle conversions from FormData strings
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($data['display_order'])) {
            $data['display_order'] = (int) $data['display_order'];
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('team_photos', 'public');
            $data['photo_url'] = '/storage/' . $path;
        }
        $member = TeamMember::create($data);

        ActivityLogger::log(
            'create',
            $member,
            sprintf('Menambahkan anggota tim %s', $member->name),
            ['new_data' => $member->toArray()]
        );

        return $this->success(
            TeamMemberResource::make($member),
            'Anggota tim berhasil ditambahkan',
            201
        );
    }

    #[OA\Get(
        path: '/api/v1/team-members/{id}',
        summary: 'Get team member detail',
        tags: ['Team Members'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'Team member not found'),
        ],
    )]
    public function show(TeamMember $teamMember): JsonResponse
    {
        return $this->success(TeamMemberResource::make($teamMember));
    }

    #[OA\Put(
        path: '/api/v1/team-members/{id}',
        summary: 'Update team member',
        description: 'Update team member information. Admin only.',
        security: [['sanctum' => []]],
        tags: ['Team Members'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'role', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', nullable: true),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'display_order', type: 'integer', nullable: true),
                    new OA\Property(property: 'is_active', type: 'boolean', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Team member updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - Admin only'),
            new OA\Response(response: 404, description: 'Team member not found'),
        ],
    )]
    public function update(Request $request, TeamMember $teamMember): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'photo' => 'nullable|mimes:jpeg,png,jpg,pdf|max:2048',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'display_order' => 'nullable|numeric|min:0',
            'is_active' => 'nullable',
        ]);

        \Illuminate\Support\Facades\Log::info('TeamMember Update Request:', $request->all());

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('TeamMember Update Validation Failed:', $validator->errors()->toArray());
            return $this->validationError($validator);
        }

        $original = $teamMember->toArray();
        $data = $validator->validated();

        // Handle conversions from FormData strings
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($data['display_order'])) {
            $data['display_order'] = (int) $data['display_order'];
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('team_photos', 'public');
            $data['photo_url'] = '/storage/' . $path;
        }
        $teamMember->update($data);

        ActivityLogger::log(
            'update',
            $teamMember,
            sprintf('Memperbarui anggota tim %s', $teamMember->name),
            [
                'old_data' => $original,
                'new_data' => $teamMember->toArray(),
            ]
        );

        return $this->success(
            TeamMemberResource::make($teamMember),
            'Anggota tim berhasil diperbarui'
        );
    }

    #[OA\Delete(
        path: '/api/v1/team-members/{id}',
        summary: 'Delete team member',
        description: 'Soft delete team member. Admin only.',
        security: [['sanctum' => []]],
        tags: ['Team Members'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Team member deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - Admin only'),
            new OA\Response(response: 404, description: 'Team member not found'),
        ],
    )]
    public function destroy(Request $request, TeamMember $teamMember): JsonResponse
    {
        $this->authorizeAdmin($request);

        $snapshot = $teamMember->toArray();

        ActivityLogger::log(
            'delete',
            $teamMember,
            sprintf('Menghapus anggota tim %s', $teamMember->name),
            ['old_data' => $snapshot]
        );

        $teamMember->delete();

        return $this->success(null, 'Anggota tim berhasil dihapus');
    }

    /**
     * Check if current user is admin
     */
    protected function isAdmin(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }

        // Direct enum comparison - role is now a UserRole enum
        return $user->role === UserRole::BPS_ADMIN;
    }

    /**
     * Authorize admin access
     */
    protected function authorizeAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Direct enum comparison - role is now a UserRole enum
        if ($user->role !== UserRole::BPS_ADMIN) {
            abort(403, 'Forbidden. Admin access required.');
        }
    }
}
