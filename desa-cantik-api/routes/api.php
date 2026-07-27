<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AdminStatisticController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\ThematicMapController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VillageController;
use App\Http\Controllers\Api\VillageModuleController;
use App\Http\Controllers\Api\VillageProfileController;
use App\Http\Controllers\Api\VillageStatisticController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FooterSettingController;
use App\Http\Controllers\Api\OnlineServiceController;


// =======================
// API Prefix-Free Group
// =======================
Route::group([], function () {

    // ===============================================
    // ENDPOINT AUTENTIKASI PUBLIK
    // ===============================================
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('auth/password/reset', [AuthController::class, 'resetPassword']);

    // ===============================================
    // ENDPOINT DATA PUBLIK
    // ===============================================
    Route::get('statistics/validation-flow', [VillageStatisticController::class, 'validationFlow']);
    Route::get('dashboard/public', [DashboardController::class, 'public']);

    // Desa (Publik)
    Route::get('villages', [VillageController::class, 'index']);
    Route::get('villages/{village}', [VillageController::class, 'show']);
    Route::get('villages/{village}/profile', [VillageProfileController::class, 'show']);
    Route::get('villages/{village}/thematic-maps', [ThematicMapController::class, 'index']);
    Route::get('thematic-maps/{map}', [ThematicMapController::class, 'show']);
    Route::get('villages/{village}/statistics', [VillageStatisticController::class, 'index']);
    Route::get('villages/{village}/statistics/summary', [VillageStatisticController::class, 'summary']);
    Route::get('villages/{village}/statistics/export', [VillageStatisticController::class, 'export'])
        ->middleware('throttle:exports');
    Route::get('villages/{village}/publications', [PublicationController::class, 'index']);
    Route::get('publications/{publication}', [PublicationController::class, 'show']);
    Route::get('publications/{publication}/download', [PublicationController::class, 'download'])
        ->name('publications.download');
    Route::get('publications/{publication}/view', [PublicationController::class, 'view'])
        ->name('publications.view');

    // Anggota Tim (Publik - hanya baca)
    Route::get('villages/{village}/documentation', [VillageController::class, 'documentation']);
    Route::get('team-members', [\App\Http\Controllers\Api\TeamMemberController::class, 'index']);
    Route::get('team-members/{teamMember}', [\App\Http\Controllers\Api\TeamMemberController::class, 'show']);
    Route::get('/footer', [FooterSettingController::class, 'get']);

    // Layanan Online (Publik)
    Route::post('villages/{village}/layanan-online/surat-pengantar', [OnlineServiceController::class, 'storeSuratPengantar']);
    Route::get('villages/{village}/layanan-online/status-pengantar', [OnlineServiceController::class, 'checkSuratPengantarStatus']);
    Route::post('villages/{village}/layanan-online/pengaduan', [OnlineServiceController::class, 'storePengaduan']);
    Route::get('villages/{village}/layanan-online/status-pengaduan', [OnlineServiceController::class, 'checkPengaduanStatus']);
    Route::post('villages/{village}/layanan-online/buku-tamu', [OnlineServiceController::class, 'storeBukuTamu']);
    Route::get('villages/{village}/layanan-online/buku-tamu', [OnlineServiceController::class, 'listBukuTamu']);
    // ===============================================
    // ENDPOINT TERLINDUNGI (Memerlukan Autentikasi)
    // ===============================================
    Route::middleware('auth:sanctum')->group(function () {

        // Aut - Manajemen Kata Sandi
        Route::put('auth/password', [AuthController::class, 'updatePassword']);

        // Dasbor
        Route::get('dashboard/admin', [DashboardController::class, 'admin'])
            ->middleware('role:bps_admin');
        Route::get('dashboard/village', [DashboardController::class, 'village'])
            ->middleware('role:bps_admin,village_officer');

        // CRUD Desa (hanya bps_admin)
        Route::middleware('role:bps_admin')->group(function () {
            Route::post('villages', [VillageController::class, 'store']);
            Route::put('villages/{village}', [VillageController::class, 'update']);
            Route::delete('villages/{village}', [VillageController::class, 'destroy']);
            Route::put('villages/{village}/toggle-status', [VillageController::class, 'toggleStatus']);

            // Manajemen pengguna
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{id}', [UserController::class, 'show']);
            Route::post('users', [UserController::class, 'store']);
            Route::put('users/{id}', [UserController::class, 'update']);
            Route::put('users/{id}/reset-password', [UserController::class, 'resetPassword']);
            Route::delete('users/{id}', [UserController::class, 'destroy']);

            // Log aktivitas
            Route::get('activity-logs', [ActivityLogController::class, 'index']);
            Route::get('activity-logs/export', [ActivityLogController::class, 'export']);
            Route::get('activity-logs/{id}', [ActivityLogController::class, 'show']);

            // Daftar statistik admin
            Route::get('statistics', [AdminStatisticController::class, 'index']);

            // Manajemen Anggota Tim (Hanya Admin)
            Route::post('team-members', [\App\Http\Controllers\Api\TeamMemberController::class, 'store']);
            Route::put('team-members/{teamMember}', [\App\Http\Controllers\Api\TeamMemberController::class, 'update']);
            Route::delete('team-members/{teamMember}', [\App\Http\Controllers\Api\TeamMemberController::class, 'destroy']);
            Route::post('/footer', [FooterSettingController::class, 'update']);
        });

        // Profil desa (bps_admin + perangkat_desa)
        Route::middleware('role:bps_admin,village_officer')->group(function () {
            Route::put('villages/{village}/profile', [VillageProfileController::class, 'update']);
            Route::post('villages/{village}/profile/logo', [VillageProfileController::class, 'uploadLogo']);
            Route::post('villages/{village}/documentation', [VillageController::class, 'storeDocumentation']);
            Route::delete('villages/{village}/documentation/{id}', [VillageController::class, 'destroyDocumentation']);

            // Layanan Online (Internal/Admin)
            Route::get('villages/{village}/layanan-online/admin/surat-pengantar', [OnlineServiceController::class, 'adminListSuratPengantar']);
            Route::put('villages/{village}/layanan-online/admin/surat-pengantar/{id}', [OnlineServiceController::class, 'adminUpdateSuratPengantar']);
            Route::get('villages/{village}/layanan-online/admin/pengaduan', [OnlineServiceController::class, 'adminListPengaduan']);
            Route::put('villages/{village}/layanan-online/admin/pengaduan/{id}', [OnlineServiceController::class, 'adminUpdatePengaduan']);
            Route::get('villages/{village}/layanan-online/admin/buku-tamu', [OnlineServiceController::class, 'adminListBukuTamu']);
        });

        // Manajemen statistik desa
        Route::post('villages/{village}/statistics', [VillageStatisticController::class, 'store']);
        Route::put('villages/{village}/statistics/{statistic}', [VillageStatisticController::class, 'update']);
        Route::delete('villages/{village}/statistics/{statistic}', [VillageStatisticController::class, 'destroy']);
        Route::post('villages/{village}/statistics/import', [VillageStatisticController::class, 'import'])
            ->middleware('throttle:imports');
        Route::put('villages/{village}/statistics/{statistic}/approve', [VillageStatisticController::class, 'approve'])
            ->middleware('role:bps_admin');
        Route::put('villages/{village}/statistics/{statistic}/reject', [VillageStatisticController::class, 'reject'])
            ->middleware('role:bps_admin');

        // Manajemen publikasi
        Route::post('villages/{village}/publications', [PublicationController::class, 'store']);
        Route::put('villages/{village}/publications/{publication}', [PublicationController::class, 'update']);
        Route::post('villages/{village}/publications/{publication}/replace-file', [PublicationController::class, 'replaceFile']);
        Route::delete('villages/{village}/publications/{publication}', [PublicationController::class, 'destroy']);

        // Manajemen Peta Tematik (includes both thematic layers and geospatial data)
        Route::post('villages/{village}/thematic-maps', [ThematicMapController::class, 'store']);
        Route::put('villages/{village}/thematic-maps/{map}', [ThematicMapController::class, 'update']);
        Route::delete('villages/{village}/thematic-maps/{map}', [ThematicMapController::class, 'destroy']);
        Route::patch('villages/{village}/thematic-maps/reorder', [ThematicMapController::class, 'reorder']);

        // Modul statistik untuk perangkat desa (perlu autentikasi tapi tidak perlu admin)
        Route::get('villages/{village}/statistic-modules', [VillageModuleController::class, 'statisticModules']);

        // Manajemen Modul Desa (BPS Admin + Perangkat Desa)
        Route::middleware('role:bps_admin,village_officer')->group(function () {
             Route::get('villages/{village}/modules', [VillageModuleController::class, 'index']);
             Route::get('villages/{village}/modules/statistics', [VillageModuleController::class, 'statisticModules']);
             Route::post('villages/{village}/modules', [VillageModuleController::class, 'store']);
             Route::put('villages/{village}/modules/{module}', [VillageModuleController::class, 'update']);
             Route::put('villages/{village}/modules/{module}/toggle', [VillageModuleController::class, 'toggle']);
             Route::delete('villages/{village}/modules/{module}', [VillageModuleController::class, 'destroy']);
        });
    });
});

// =======================
// Rute kompatibel ke belakang (opsional)
// =======================
Route::get('villages', [VillageController::class, 'index']);
Route::get('villages/{village}', [VillageController::class, 'show']);

// Endpoint warisan untuk informasi pengguna
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->load('role', 'village');
});

// Endpoint JSON dokumentasi OpenAPI
Route::get('/documentation/json', function () {
    $jsonPath = storage_path('api-docs/api-docs.json');
    if (! file_exists($jsonPath)) {
        Artisan::call('openapi:generate');
    }

    return response()->file($jsonPath, ['Content-Type' => 'application/json']);
});
