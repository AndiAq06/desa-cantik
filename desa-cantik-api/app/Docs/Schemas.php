<?php

namespace App\Docs;

use OpenApi\Attributes as OA;

/**
 * Shared schema references used across the Desa Cantik API documentation.
 */
class Schemas
{
    #[OA\Schema(schema: 'ErrorResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: false),
        new OA\Property(property: 'message', type: 'string', example: 'Login failed'),
        new OA\Property(property: 'errors', type: 'object', nullable: true, example: ['login' => ['Invalid credentials']]),
    ])]
    public static function errorResponse() {}

    #[OA\Schema(schema: 'ValidationErrorResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: false),
        new OA\Property(property: 'message', type: 'string', example: 'Validation failed'),
        new OA\Property(property: 'errors', type: 'object', example: ['email' => ['The email has already been taken.']]),
    ])]
    public static function validationErrorResponse() {}

    #[OA\Schema(schema: 'AuthUser', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'username', type: 'string', example: 'admin'),
        new OA\Property(property: 'email', type: 'string', example: 'admin@desa.id'),
        new OA\Property(property: 'full_name', type: 'string', example: 'Admin Desa Cantik'),
        new OA\Property(property: 'phone', type: 'string', example: '+628123456789'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'role', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'role_name', type: 'string', example: 'bps_admin'),
            new OA\Property(property: 'display_name', type: 'string', example: 'Admin BPS'),
        ]),
        new OA\Property(property: 'village', type: 'object', nullable: true, properties: [
            new OA\Property(property: 'id', type: 'integer', example: 10),
            new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
            new OA\Property(property: 'kode', type: 'string', example: '7310022001'),
        ]),
    ])]
    public static function authUser() {}

    #[OA\Schema(schema: 'AuthResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Login successful'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'user', ref: '#/components/schemas/AuthUser'),
            new OA\Property(property: 'token', type: 'string', example: '1|uYtA...'),
            new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
        ]),
    ])]
    public static function authResponse() {}

    #[OA\Schema(schema: 'PasswordResetLinkResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Password reset link sent to your email'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'reset_token', type: 'string', example: 'G63h1...'),
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@desa.id'),
        ]),
    ])]
    public static function passwordResetLinkResponse() {}

    #[OA\Schema(schema: 'TokenResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Token refreshed successfully'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'token', type: 'string', example: '1|uYtA...'),
            new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
        ]),
    ])]
    public static function tokenResponse() {}

    #[OA\Schema(schema: 'UserProfileResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Profile updated successfully'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'username', type: 'string', example: 'admin'),
            new OA\Property(property: 'email', type: 'string', example: 'admin@desa.id'),
            new OA\Property(property: 'full_name', type: 'string', example: 'Admin Desa Cantik'),
            new OA\Property(property: 'phone', type: 'string', example: '+628123456789'),
        ]),
    ])]
    public static function userProfileResponse() {}

    #[OA\Schema(schema: 'MessageResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Operation completed'),
    ])]
    public static function messageResponse() {}

    #[OA\Schema(schema: 'RegisterRequest', type: 'object', required: ['username', 'email', 'password', 'password_confirmation', 'role'], properties: [
        new OA\Property(property: 'username', type: 'string', example: 'desa_admin'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@desa.id'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'secret123'),
        new OA\Property(property: 'role', type: 'string', enum: ['bps_admin', 'village_officer', 'guest'], example: 'village_officer'),
        new OA\Property(property: 'village_id', type: 'integer', nullable: true, example: 10),
        new OA\Property(property: 'full_name', type: 'string', nullable: true, example: 'Admin Desa Nonongan'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '+628123456789'),
    ])]
    public static function registerRequest() {}

    #[OA\Schema(schema: 'LoginRequest', type: 'object', required: ['password'], properties: [
        new OA\Property(property: 'login', type: 'string', example: 'admin@desa.id', description: 'Email or username'),
        new OA\Property(property: 'username', type: 'string', example: 'admin', description: 'Alternative to `login`'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123'),
    ])]
    public static function loginRequest() {}

    #[OA\Schema(schema: 'ForgotPasswordRequest', type: 'object', required: ['email'], properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@desa.id'),
    ])]
    public static function forgotPasswordRequest() {}

    #[OA\Schema(schema: 'ResetPasswordRequest', type: 'object', required: ['email', 'token', 'password', 'password_confirmation'], properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@desa.id'),
        new OA\Property(property: 'token', type: 'string', example: '123456'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'secret123'),
    ])]
    public static function resetPasswordRequest() {}

    #[OA\Schema(schema: 'UpdateProfileRequest', type: 'object', properties: [
        new OA\Property(property: 'full_name', type: 'string', example: 'Admin Desa Cantik'),
        new OA\Property(property: 'phone', type: 'string', example: '+628123456789'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@desa.id'),
    ])]
    public static function updateProfileRequest() {}

    #[OA\Schema(schema: 'UpdatePasswordRequest', type: 'object', required: ['current_password', 'new_password', 'new_password_confirmation'], properties: [
        new OA\Property(property: 'current_password', type: 'string', format: 'password', example: 'old-secret'),
        new OA\Property(property: 'new_password', type: 'string', format: 'password', example: 'new-secret123'),
        new OA\Property(property: 'new_password_confirmation', type: 'string', format: 'password', example: 'new-secret123'),
    ])]
    public static function updatePasswordRequest() {}

    #[OA\Schema(schema: 'VillageResource', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'string', example: '10'),
        new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
        new OA\Property(property: 'district', type: 'string', example: 'Rantebua'),
        new OA\Property(property: 'regency', type: 'string', example: 'Toraja Utara'),
        new OA\Property(property: 'province', type: 'string', example: 'Sulawesi Selatan'),
        new OA\Property(property: 'population', type: 'integer', example: 5310),
        new OA\Property(property: 'status', type: 'string', example: 'Aktif'),
        new OA\Property(property: 'image', type: 'string', format: 'uri', example: 'https://cdn.desacantik.id/images/nonongan.jpg'),
        new OA\Property(property: 'area', type: 'number', format: 'float', example: 17.2),
        new OA\Property(property: 'households', type: 'integer', example: 1200),
    ])]
    public static function villageResource() {}

    #[OA\Schema(schema: 'VillageCreateRequest', type: 'object', required: ['name', 'location'], properties: [
        new OA\Property(property: 'name', type: 'string', example: 'Desa Baru'),
        new OA\Property(property: 'location', type: 'string', example: 'Toraja Utara'),
        new OA\Property(property: 'kecamatan', type: 'string', nullable: true, example: 'Rantebua'),
        new OA\Property(property: 'kabupaten', type: 'string', nullable: true, example: 'Toraja Utara'),
        new OA\Property(property: 'provinsi', type: 'string', nullable: true, example: 'Sulawesi Selatan'),
    ])]
    public static function villageCreateRequest() {}

    #[OA\Schema(schema: 'AdminDashboardResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'summary', type: 'object', properties: [
                new OA\Property(property: 'total_villages', type: 'integer', example: 15),
                new OA\Property(property: 'active_villages', type: 'integer', example: 12),
                new OA\Property(property: 'inactive_villages', type: 'integer', example: 3),
                new OA\Property(property: 'total_users', type: 'integer', example: 25),
                new OA\Property(property: 'active_users', type: 'integer', example: 20),
                new OA\Property(property: 'total_statistics', type: 'integer', example: 450),
                new OA\Property(property: 'total_publications', type: 'integer', example: 78),
                new OA\Property(property: 'total_thematic_maps', type: 'integer', example: 12),
            ]),
            new OA\Property(property: 'recent_activities', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'id', type: 'integer', example: 152),
                new OA\Property(property: 'user', type: 'string', example: 'Admin BPS'),
                new OA\Property(property: 'action', type: 'string', example: 'created'),
                new OA\Property(property: 'description', type: 'string', example: 'Created new village statistic'),
                new OA\Property(property: 'timestamp', type: 'string', format: 'date-time', example: '2025-01-17T10:30:00Z'),
            ])),
            new OA\Property(property: 'villages_statistics', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'village_name', type: 'string', example: 'Desa Nonongan Selatan'),
                new OA\Property(property: 'statistics_count', type: 'integer', example: 45),
                new OA\Property(property: 'publications_count', type: 'integer', example: 8),
                new OA\Property(property: 'last_updated', type: 'string', format: 'date-time', example: '2025-01-15T14:20:00Z'),
            ])),
            new OA\Property(property: 'monthly_activities', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'month', type: 'string', example: 'Jan 2025'),
                new OA\Property(property: 'statistics_created', type: 'integer', example: 25),
                new OA\Property(property: 'statistics_updated', type: 'integer', example: 12),
                new OA\Property(property: 'publications_uploaded', type: 'integer', example: 5),
            ])),
        ]),
    ])]
    public static function adminDashboardResponse() {}

    #[OA\Schema(schema: 'VillageDashboardResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'village', type: 'object', properties: [
                new OA\Property(property: 'id', type: 'integer', example: 10),
                new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
                new OA\Property(property: 'code', type: 'string', example: '7310022001'),
            ]),
            new OA\Property(property: 'summary', type: 'object', properties: [
                new OA\Property(property: 'total_statistics', type: 'integer', example: 45),
                new OA\Property(property: 'statistics_this_year', type: 'integer', example: 12),
                new OA\Property(property: 'total_publications', type: 'integer', example: 8),
                new OA\Property(property: 'publications_this_year', type: 'integer', example: 3),
                new OA\Property(property: 'thematic_maps', type: 'integer', example: 5),
                new OA\Property(property: 'map_points', type: 'integer', example: 23),
                new OA\Property(property: 'last_update', type: 'string', format: 'date-time', example: '2025-01-15T14:20:00Z'),
            ]),
            new OA\Property(property: 'recent_activities', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'id', type: 'integer', example: 152),
                new OA\Property(property: 'user', type: 'string', example: 'Petugas Desa'),
                new OA\Property(property: 'action', type: 'string', example: 'updated'),
                new OA\Property(property: 'description', type: 'string', example: 'Updated village profile'),
                new OA\Property(property: 'timestamp', type: 'string', format: 'date-time', example: '2025-01-17T10:30:00Z'),
            ])),
            new OA\Property(property: 'statistics_by_category', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'category', type: 'string', example: 'Kependudukan'),
                new OA\Property(property: 'count', type: 'integer', example: 15),
            ])),
            new OA\Property(property: 'profile_completeness', type: 'number', format: 'float', example: 85.5),
        ]),
    ])]
    public static function villageDashboardResponse() {}

    #[OA\Schema(schema: 'PublicDashboardResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'summary', type: 'object', properties: [
                new OA\Property(property: 'total_villages', type: 'integer', example: 15),
                new OA\Property(property: 'total_population', type: 'integer', example: 67500),
                new OA\Property(property: 'total_area', type: 'number', format: 'float', example: 245.7),
                new OA\Property(property: 'total_statistics', type: 'integer', example: 450),
            ]),
            new OA\Property(property: 'featured_villages', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'id', type: 'integer', example: 10),
                new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
                new OA\Property(property: 'population', type: 'integer', example: 5310),
                new OA\Property(property: 'area', type: 'number', format: 'float', example: 17.2),
                new OA\Property(property: 'image', type: 'string', format: 'uri', example: 'https://cdn.desacantik.id/images/nonongan.jpg'),
            ])),
            new OA\Property(property: 'latest_publications', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'id', type: 'integer', example: 23),
                new OA\Property(property: 'title', type: 'string', example: 'Laporan Statistik Desa 2024'),
                new OA\Property(property: 'village', type: 'string', example: 'Desa Nonongan Selatan'),
                new OA\Property(property: 'published_at', type: 'string', format: 'date', example: '2025-01-10'),
            ])),
            new OA\Property(property: 'statistics_overview', type: 'array', items: new OA\Items(type: 'object', properties: [
                new OA\Property(property: 'category', type: 'string', example: 'Kependudukan'),
                new OA\Property(property: 'total', type: 'integer', example: 120),
            ])),
        ]),
    ])]
    public static function publicDashboardResponse() {}

    #[OA\Schema(schema: 'VillageProfile', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'village_id', type: 'integer', example: 10),
        new OA\Property(property: 'description', type: 'string', example: 'Desa Nonongan Selatan adalah desa yang terletak di Kecamatan Rantebua...'),
        new OA\Property(property: 'vision', type: 'string', example: 'Mewujudkan desa yang maju, sejahtera, dan mandiri'),
        new OA\Property(property: 'mission', type: 'array', items: new OA\Items(type: 'string'), example: ['Meningkatkan kualitas SDM', 'Mengembangkan ekonomi desa', 'Memperkuat infrastruktur']),
        new OA\Property(property: 'area', type: 'number', format: 'float', example: 17.2),
        new OA\Property(property: 'population', type: 'integer', example: 5310),
        new OA\Property(property: 'address', type: 'string', example: 'Jl. Poros Rantebua-Balusu, Kec. Rantebua'),
        new OA\Property(property: 'phone', type: 'string', example: '+62821234567890'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'nonongan@desacantik.id'),
        new OA\Property(property: 'website', type: 'string', format: 'uri', example: 'https://nonongan.desacantik.id'),
        new OA\Property(property: 'logo_url', type: 'string', format: 'uri', example: 'https://cdn.desacantik.id/logos/nonongan.png'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-10T08:30:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2025-01-15T14:20:00Z'),
    ])]
    public static function villageProfile() {}

    #[OA\Schema(schema: 'VillageProfileResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', ref: '#/components/schemas/VillageProfile'),
    ])]
    public static function villageProfileResponse() {}

    #[OA\Schema(schema: 'UpdateVillageProfileRequest', type: 'object', properties: [
        new OA\Property(property: 'description', type: 'string', example: 'Updated village description'),
        new OA\Property(property: 'vision', type: 'string', example: 'Updated village vision'),
        new OA\Property(property: 'mission', type: 'array', items: new OA\Items(type: 'string'), example: ['Mission 1', 'Mission 2']),
        new OA\Property(property: 'area', type: 'number', format: 'float', example: 17.5),
        new OA\Property(property: 'population', type: 'integer', example: 5400),
        new OA\Property(property: 'address', type: 'string', example: 'Updated address'),
        new OA\Property(property: 'phone', type: 'string', example: '+62821234567890'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'village@example.com'),
        new OA\Property(property: 'website', type: 'string', format: 'uri', example: 'https://village.example.com'),
        new OA\Property(property: 'logo_url', type: 'string', format: 'uri', example: 'https://cdn.example.com/logo.png'),
    ])]
    public static function updateVillageProfileRequest() {}

    #[OA\Schema(schema: 'VillageModule', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'village_id', type: 'integer', example: 10),
        new OA\Property(property: 'module_name', type: 'string', example: 'Profil Desa'),
        new OA\Property(property: 'is_enabled', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-10T08:30:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2025-01-15T14:20:00Z'),
    ])]
    public static function villageModule() {}

    #[OA\Schema(schema: 'VillageModulesResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/VillageModule')),
    ])]
    public static function villageModulesResponse() {}

    #[OA\Schema(schema: 'ToggleModuleRequest', type: 'object', required: ['is_enabled'], properties: [
        new OA\Property(property: 'is_enabled', type: 'boolean', example: true),
    ])]
    public static function toggleModuleRequest() {}

    #[OA\Schema(schema: 'ActivityLog', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 152),
        new OA\Property(property: 'user_id', type: 'integer', example: 5),
        new OA\Property(property: 'village_id', type: 'integer', nullable: true, example: 10),
        new OA\Property(property: 'action', type: 'string', example: 'created'),
        new OA\Property(property: 'model_type', type: 'string', example: 'App\Models\VillageStatistic'),
        new OA\Property(property: 'model_id', type: 'integer', example: 234),
        new OA\Property(property: 'description', type: 'string', example: 'Created new village statistic'),
        new OA\Property(property: 'old_data', type: 'object', nullable: true),
        new OA\Property(property: 'new_data', type: 'object', nullable: true),
        new OA\Property(property: 'ip_address', type: 'string', nullable: true, example: '192.168.1.100'),
        new OA\Property(property: 'user_agent', type: 'string', nullable: true, example: 'Mozilla/5.0...'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2025-01-17T10:30:00Z'),
        new OA\Property(property: 'user', type: 'object', nullable: true, properties: [
            new OA\Property(property: 'id', type: 'integer', example: 5),
            new OA\Property(property: 'username', type: 'string', example: 'admin'),
            new OA\Property(property: 'full_name', type: 'string', example: 'Admin BPS'),
        ]),
        new OA\Property(property: 'village', type: 'object', nullable: true, properties: [
            new OA\Property(property: 'id', type: 'integer', example: 10),
            new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
            new OA\Property(property: 'code', type: 'string', example: '7310022001'),
        ]),
    ])]
    public static function activityLog() {}

    #[OA\Schema(schema: 'ActivityLogsResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/ActivityLog')),
        new OA\Property(property: 'meta', type: 'object', properties: [
            new OA\Property(property: 'current_page', type: 'integer', example: 1),
            new OA\Property(property: 'per_page', type: 'integer', example: 15),
            new OA\Property(property: 'total', type: 'integer', example: 450),
            new OA\Property(property: 'last_page', type: 'integer', example: 30),
        ]),
    ])]
    public static function activityLogsResponse() {}

    #[OA\Schema(schema: 'ActivityLogDetailResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', ref: '#/components/schemas/ActivityLog'),
    ])]
    public static function activityLogDetailResponse() {}

    #[OA\Schema(schema: 'MapPoint', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 45),
        new OA\Property(property: 'thematic_map_id', type: 'integer', example: 7),
        new OA\Property(property: 'name', type: 'string', example: 'SD Negeri 1 Nonongan'),
        new OA\Property(property: 'description', type: 'string', example: 'Sekolah dasar negeri'),
        new OA\Property(property: 'category', type: 'string', example: 'Pendidikan'),
        new OA\Property(property: 'latitude', type: 'number', format: 'double', example: -2.8954),
        new OA\Property(property: 'longitude', type: 'number', format: 'double', example: 119.7625),
        new OA\Property(property: 'image_url', type: 'string', format: 'uri', nullable: true, example: 'https://cdn.desacantik.id/points/sd1.jpg'),
        new OA\Property(property: 'additional_info', type: 'object', nullable: true, example: ['jumlah_siswa' => 150, 'status' => 'Aktif']),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2025-01-15T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2025-01-17T14:30:00Z'),
    ])]
    public static function mapPoint() {}

    #[OA\Schema(schema: 'MapPointResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Map point created successfully'),
        new OA\Property(property: 'data', ref: '#/components/schemas/MapPoint'),
    ])]
    public static function mapPointResponse() {}

    #[OA\Schema(schema: 'CreateMapPointRequest', type: 'object', required: ['name', 'latitude', 'longitude'], properties: [
        new OA\Property(property: 'name', type: 'string', example: 'SD Negeri 1 Nonongan'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Sekolah dasar negeri'),
        new OA\Property(property: 'category', type: 'string', nullable: true, example: 'Pendidikan'),
        new OA\Property(property: 'latitude', type: 'number', format: 'double', example: -2.8954),
        new OA\Property(property: 'longitude', type: 'number', format: 'double', example: 119.7625),
        new OA\Property(property: 'image_url', type: 'string', format: 'uri', nullable: true, example: 'https://cdn.desacantik.id/points/sd1.jpg'),
        new OA\Property(property: 'additional_info', type: 'object', nullable: true, example: ['jumlah_siswa' => 150, 'status' => 'Aktif']),
    ])]
    public static function createMapPointRequest() {}

    #[OA\Schema(schema: 'UpdateMapPointRequest', type: 'object', properties: [
        new OA\Property(property: 'name', type: 'string', example: 'SD Negeri 1 Nonongan (Updated)'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Updated description'),
        new OA\Property(property: 'category', type: 'string', nullable: true, example: 'Pendidikan'),
        new OA\Property(property: 'latitude', type: 'number', format: 'double', example: -2.8954),
        new OA\Property(property: 'longitude', type: 'number', format: 'double', example: 119.7625),
        new OA\Property(property: 'image_url', type: 'string', format: 'uri', nullable: true, example: 'https://cdn.desacantik.id/points/sd1-new.jpg'),
        new OA\Property(property: 'additional_info', type: 'object', nullable: true, example: ['jumlah_siswa' => 155, 'status' => 'Aktif']),
    ])]
    public static function updateMapPointRequest() {}

    #[OA\Schema(schema: 'VillageDetail', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 10),
        new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
        new OA\Property(property: 'district', type: 'string', example: 'Rantebua'),
        new OA\Property(property: 'regency', type: 'string', example: 'Toraja Utara'),
        new OA\Property(property: 'province', type: 'string', example: 'Sulawesi Selatan'),
        new OA\Property(property: 'code', type: 'string', example: '7310022001'),
        new OA\Property(property: 'population', type: 'integer', example: 5310),
        new OA\Property(property: 'area', type: 'number', format: 'float', example: 17.2),
        new OA\Property(property: 'households', type: 'integer', example: 1200),
        new OA\Property(property: 'status', type: 'string', example: 'Aktif'),
        new OA\Property(property: 'image', type: 'string', format: 'uri', nullable: true, example: 'https://cdn.desacantik.id/villages/nonongan.jpg'),
        new OA\Property(property: 'logoUrl', type: 'string', format: 'uri', nullable: true, example: 'https://cdn.desacantik.id/logos/nonongan.png'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Desa Nonongan Selatan adalah...'),
        new OA\Property(property: 'vision', type: 'string', nullable: true, example: 'Mewujudkan desa yang maju...'),
        new OA\Property(property: 'mission', type: 'array', items: new OA\Items(type: 'string'), nullable: true),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: 'Jl. Poros Rantebua-Balusu'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '+62821234567890'),
        new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true, example: 'nonongan@desacantik.id'),
        new OA\Property(property: 'website', type: 'string', format: 'uri', nullable: true, example: 'https://nonongan.desacantik.id'),
    ])]
    public static function villageDetail() {}

    #[OA\Schema(schema: 'VillagesResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/VillageDetail')),
        new OA\Property(property: 'meta', type: 'object', properties: [
            new OA\Property(property: 'current_page', type: 'integer', example: 1),
            new OA\Property(property: 'per_page', type: 'integer', example: 15),
            new OA\Property(property: 'total', type: 'integer', example: 15),
            new OA\Property(property: 'last_page', type: 'integer', example: 1),
        ]),
    ])]
    public static function villagesResponse() {}

    #[OA\Schema(schema: 'VillageDetailResponse', type: 'object', properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', ref: '#/components/schemas/VillageDetail'),
    ])]
    public static function villageDetailResponse() {}

    #[OA\Schema(schema: 'Publication', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 23),
        new OA\Property(property: 'title', type: 'string', example: 'Laporan Statistik Desa 2024'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Laporan lengkap statistik desa tahun 2024'),
        new OA\Property(property: 'file_name', type: 'string', example: 'laporan-statistik-2024.pdf'),
        new OA\Property(property: 'file_size_bytes', type: 'integer', example: 2457600),
        new OA\Property(property: 'file_url', type: 'string', format: 'uri', example: 'https://cdn.desacantik.id/publications/laporan-2024.pdf'),
        new OA\Property(property: 'published_at', type: 'string', format: 'date', example: '2024-12-15'),
        new OA\Property(property: 'uploaded_by', type: 'string', example: 'Admin BPS'),
        new OA\Property(property: 'village', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 10),
            new OA\Property(property: 'name', type: 'string', example: 'Desa Nonongan Selatan'),
            new OA\Property(property: 'code', type: 'string', example: '7310022001'),
        ]),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-12-20T08:30:00Z'),
    ])]
    public static function publication() {}

    #[OA\Schema(schema: 'VillageStatistic', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 234),
        new OA\Property(property: 'village_id', type: 'integer', example: 10),
        new OA\Property(property: 'type_id', type: 'integer', example: 5),
        new OA\Property(property: 'category', type: 'string', example: 'Kependudukan'),
        new OA\Property(property: 'indicator', type: 'string', example: 'Jumlah Penduduk'),
        new OA\Property(property: 'year', type: 'integer', example: 2024),
        new OA\Property(property: 'value', type: 'number', format: 'float', example: 5310.0),
        new OA\Property(property: 'unit', type: 'string', example: 'jiwa'),
        new OA\Property(property: 'verified', type: 'boolean', example: true),
        new OA\Property(property: 'verified_by', type: 'string', nullable: true, example: 'Admin BPS'),
        new OA\Property(property: 'verified_at', type: 'string', format: 'date-time', nullable: true, example: '2024-12-20T10:00:00Z'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-12-15T14:30:00Z'),
    ])]
    public static function villageStatistic() {}

    #[OA\Schema(schema: 'ThematicMap', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 7),
        new OA\Property(property: 'village_id', type: 'integer', example: 10),
        new OA\Property(property: 'title', type: 'string', example: 'Peta Fasilitas Pendidikan'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Peta lokasi fasilitas pendidikan di desa'),
        new OA\Property(property: 'category', type: 'string', example: 'Pendidikan'),
        new OA\Property(property: 'year', type: 'integer', nullable: true, example: 2024),
        new OA\Property(property: 'is_public', type: 'boolean', example: true),
        new OA\Property(property: 'points_count', type: 'integer', example: 12),
        new OA\Property(property: 'created_by', type: 'string', example: 'Petugas Desa'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-11-10T09:00:00Z'),
    ])]
    public static function thematicMap() {}

    #[OA\Schema(schema: 'GeospatialData', type: 'object', properties: [
        new OA\Property(property: 'id', type: 'integer', example: 3),
        new OA\Property(property: 'village_id', type: 'integer', example: 10),
        new OA\Property(property: 'layer_name', type: 'string', example: 'Batas Desa'),
        new OA\Property(property: 'layer_type', type: 'string', example: 'boundary'),
        new OA\Property(property: 'geojson', type: 'object', example: ['type' => 'FeatureCollection', 'features' => []]),
        new OA\Property(property: 'style', type: 'object', nullable: true, example: ['color' => '#FF0000', 'weight' => 2]),
        new OA\Property(property: 'is_visible', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-10-01T12:00:00Z'),
    ])]
    public static function geospatialData() {}
}
