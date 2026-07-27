<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/register',
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns an initial Sanctum bearer token.',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/RegisterRequest')),
        responses: [
            new OA\Response(response: 201, description: 'User registered successfully', content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
            new OA\Response(response: 500, description: 'Unexpected error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', 'string', 'in:bps_admin,village_officer,guest'],
            'village_id' => 'nullable|exists:villages,id',
            'full_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'village_id' => $request->village_id,
            'full_name' => $request->full_name,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role?->value,
                'role_display' => $user->role?->displayName(),
                'village_id' => $user->village_id,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully', 201);
    }

    #[OA\Post(
        path: '/api/v1/auth/login',
        tags: ['Auth'],
        summary: 'Login with email or username',
        description: 'Authenticates a user and returns a Sanctum bearer token. Accepts either email or username in the `login` field.',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/LoginRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Login successful', content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')),
            new OA\Response(response: 401, description: 'Invalid credentials', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
            new OA\Response(response: 500, description: 'Unexpected error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required_without:username|string',
            'username' => 'required_without:login|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $loginField = $request->input('login') ?? $request->input('username');

        $user = User::where('email', $loginField)
            ->orWhere('username', $loginField)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('village');

        return $this->success([
            'user' => [
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
                    'kode' => $user->village->village_code,
                    'has_layanan_online' => (bool) $user->village->has_layanan_online,
                ] : null,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful', 200);
    }

    #[OA\Get(
        path: '/api/v1/auth/user',
        tags: ['Auth'],
        summary: 'Get authenticated user profile',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Authenticated user detail', content: new OA\JsonContent(type: 'object', properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/AuthUser'),
            ])),
            new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('village');

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
                'kode' => $user->village->village_code,
                'has_layanan_online' => (bool) $user->village->has_layanan_online,
            ] : null,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ], null, 200);
    }

    #[OA\Put(
        path: '/api/v1/auth/profile',
        tags: ['Auth'],
        summary: 'Update authenticated user profile',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/UpdateProfileRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Profile updated', content: new OA\JsonContent(ref: '#/components/schemas/UserProfileResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'full_name' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:users,email,'.$user->id,
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $user->update($request->only(['full_name', 'email']));

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
        ], 'Profile updated successfully', 200);
    }

    #[OA\Put(
        path: '/api/v1/auth/password',
        tags: ['Auth'],
        summary: 'Update password',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/UpdatePasswordRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Password updated', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Current password invalid or unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
        ],
    )]
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        if (! Hash::check($request->current_password, $user->password)) {
            return $this->unauthorized('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        $user->tokens()->delete();

        return $this->success(null, 'Password updated successfully. Please login again.');
    }

    #[OA\Post(
        path: '/api/v1/auth/password/forgot',
        tags: ['Auth'],
        summary: 'Request password reset link',
        description: 'Generates a reset token and sends the password reset link to the user email.',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/ForgotPasswordRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Reset link created', content: new OA\JsonContent(ref: '#/components/schemas/PasswordResetLinkResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
            new OA\Response(response: 500, description: 'Unexpected error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $token = Str::random(64);
        $user = User::where('email', $request->email)->first();

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now(),
            ]
        );

        // Send password reset email
        Mail::to($request->email)->send(
            new ResetPasswordMail($token, $request->email, $user->full_name ?? $user->username)
        );

        return $this->success(null, 'Password reset link has been sent to your email');
    }

    #[OA\Post(
        path: '/api/v1/auth/password/reset',
        tags: ['Auth'],
        summary: 'Reset password with token',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/ResetPasswordRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Password reset successfully', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 400, description: 'Invalid or expired reset token', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')),
            new OA\Response(response: 500, description: 'Unexpected error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $passwordReset || ! Hash::check($request->token, $passwordReset->token)) {
            return $this->error('Invalid or expired reset token', 400);
        }

        if (Carbon::parse($passwordReset->created_at)->addHours(24)->isPast()) {
            return $this->error('Reset token has expired', 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $user->tokens()->delete();

        return $this->success(null, 'Password has been reset successfully');
    }

    #[OA\Post(
        path: '/api/v1/auth/logout',
        tags: ['Auth'],
        summary: 'Logout current session',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Logout successful', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout successful');
    }

    #[OA\Post(
        path: '/api/v1/auth/logout/all',
        tags: ['Auth'],
        summary: 'Logout from all devices',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'All tokens revoked', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return $this->success(null, 'Logged out from all devices successfully');
    }

    #[OA\Post(
        path: '/api/v1/auth/token/refresh',
        tags: ['Auth'],
        summary: 'Refresh Sanctum token',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Token refreshed', content: new OA\JsonContent(ref: '#/components/schemas/TokenResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function refresh(Request $request)
    {
        $user = $request->user();
        $request->user()->currentAccessToken()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Token refreshed successfully', 200);
    }
}
