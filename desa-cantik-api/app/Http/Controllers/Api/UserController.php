<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/api/v1/users',
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve paginated list of users with optional filters (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', description: 'Page number', schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', description: 'Items per page', schema: new OA\Schema(type: 'integer', default: 15, maximum: 100)),
            new OA\Parameter(name: 'role', in: 'query', description: 'Filter by role name', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'village_id', in: 'query', description: 'Filter by village ID', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'search', in: 'query', description: 'Search by full_name, username, or email', schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'Success'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')]
    )]
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);

        $query = User::query()
            ->with(['village:id,name,village_code'])
            ->select(['users.id', 'users.username', 'users.email', 'users.full_name', 'users.role', 'users.village_id', 'users.created_at', 'users.updated_at']);

        // Filter by role - now uses role column directly
        if ($request->filled('role')) {
            $query->where('users.role', $request->query('role'));
        }

        if ($request->filled('village_id')) {
            $query->where('users.village_id', $request->query('village_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('users.full_name', 'LIKE', "%{$search}%")
                    ->orWhere('users.username', 'LIKE', "%{$search}%")
                    ->orWhere('users.email', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->orderBy('users.created_at', 'desc')->paginate($perPage);

        // Transform role enum to object
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => [
                    'role_name' => $user->role?->value,
                    'display_name' => $user->role?->displayName(),
                ],
                'village' => $user->village ? [
                    'id' => $user->village->id,
                    'name' => $user->village->name,
                    'code' => $user->village->village_code,
                ] : null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return $this->paginated($users);
    }

    #[OA\Get(
        path: '/api/v1/users/{id}',
        tags: ['Users'],
        summary: 'Get user detail',
        description: 'Get detailed information about a specific user (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, description: 'User ID', schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Success'), new OA\Response(response: 404, description: 'User not found')]
    )]
    public function show($id): JsonResponse
    {
        $user = User::with(['village:id,name,village_code,kecamatan'])
            ->findOrFail($id);

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => [
                'role_name' => $user->role?->value,
                'display_name' => $user->role?->displayName(),
            ],
            'village' => $user->village ? [
                'id' => $user->village->id,
                'name' => $user->village->name,
                'code' => $user->village->village_code,
                'district' => $user->village->kecamatan,
            ] : null,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/users',
        tags: ['Users'],
        summary: 'Create new user',
        description: 'Create a new user account (BPS Admin only)',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent),
        responses: [new OA\Response(response: 201, description: 'User created successfully'), new OA\Response(response: 422, description: 'Validation error')]
    )]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:100|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'required|string|max:255',
            'role' => ['required', Rule::in([UserRole::BPS_ADMIN->value, UserRole::VILLAGE_OFFICER->value])],
            'village_id' => 'required_if:role,'.UserRole::VILLAGE_OFFICER->value.'|nullable|exists:villages,id',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'role' => $request->role,
            'village_id' => $request->village_id,
        ]);

        $user->load(['village:id,name,village_code']);

        ActivityLogger::log('create', $user, 'Menambahkan akun pengguna baru');

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => [
                'role_name' => $user->role?->value,
                'display_name' => $user->role?->displayName(),
            ],
            'village' => $user->village ? [
                'id' => $user->village->id,
                'name' => $user->village->name,
                'code' => $user->village->village_code,
            ] : null,
        ], 'User created successfully', 201);
    }

    #[OA\Put(
        path: '/api/v1/users/{id}',
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update user information (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User updated successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ],
    )]
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|max:100|unique:users,username,'.$id,
            'email' => 'sometimes|email|max:255|unique:users,email,'.$id,
            'full_name' => 'sometimes|string|max:255',
            'role' => ['sometimes', Rule::in([UserRole::BPS_ADMIN->value, UserRole::VILLAGE_OFFICER->value])],
            'village_id' => 'sometimes|nullable|exists:villages,id',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldData = $user->toArray();

        if ($request->has('username')) {
            $user->username = $request->username;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('full_name')) {
            $user->full_name = $request->full_name;
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }
        if ($request->has('village_id')) {
            $user->village_id = $request->village_id;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();
        $user->load(['village:id,name,village_code']);

        ActivityLogger::log('update', $user, 'Memperbarui akun pengguna', [
            'old_data' => $oldData,
            'new_data' => $user->toArray(),
        ]);

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => [
                'role_name' => $user->role?->value,
                'display_name' => $user->role?->displayName(),
            ],
            'village' => $user->village ? [
                'id' => $user->village->id,
                'name' => $user->village->name,
                'code' => $user->village->village_code,
            ] : null,
        ], 'User updated successfully');
    }

    #[OA\Delete(
        path: '/api/v1/users/{id}',
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete a user account (BPS Admin only, cannot delete self)',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted successfully'),
            new OA\Response(response: 403, description: 'Cannot delete own account'),
            new OA\Response(response: 404, description: 'User not found'),
        ],
    )]
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting own account
        if ($user->id === $request->user()->id) {
            return $this->forbidden('You cannot delete your own account');
        }

        ActivityLogger::log('delete', $user, 'Menghapus akun pengguna', [
            'old_data' => $user->toArray(),
        ]);

        $user->delete();

        return $this->success(null, 'User deleted successfully');
    }

    #[OA\Put(
        path: '/api/v1/users/{id}/reset-password',
        tags: ['Users'],
        summary: 'Reset user password (Admin only)',
        description: 'Reset a user password without requiring old password (BPS Admin only)',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['password'],
                properties: [
                    new OA\Property(property: 'password', type: 'string', minLength: 8, description: 'New password'),
                    new OA\Property(property: 'password_confirmation', type: 'string', description: 'Password confirmation'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password reset successfully'),
            new OA\Response(response: 403, description: 'Cannot reset own password'),
            new OA\Response(response: 404, description: 'User not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ],
    )]
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent resetting own password (use updatePassword endpoint instead)
        if ($user->id === $request->user()->id) {
            return $this->forbidden('Cannot reset your own password. Use the update password endpoint instead.');
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke all tokens for this user (force re-login)
        $user->tokens()->delete();

        ActivityLogger::log('update', $user, "Reset password oleh admin untuk pengguna: {$user->username}", [
            'admin_id' => $request->user()->id,
            'user_id' => $user->id,
        ]);

        return $this->success(null, 'Password reset successfully. User must login again.');
    }
}
