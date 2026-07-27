<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        // Add CORS headers for all API requests - must be first
        $middleware->priority([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle database query exceptions to prevent SQL exposure
        $exceptions->render(function (QueryException $e, Request $request) {
            // Log the full error for debugging (server-side only)
            Log::error('Database Error: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'code' => $e->getCode(),
            ]);

            // Determine user-friendly error message based on error code
            $errorCode = $e->errorInfo[1] ?? null;
            $message = match ($errorCode) {
                1048, 1364 => 'Data yang diperlukan tidak lengkap. Pastikan semua field wajib telah diisi.',
                1062 => 'Data yang Anda masukkan sudah ada dalam sistem.',
                1451 => 'Data tidak dapat dihapus karena masih digunakan oleh data lain.',
                1452 => 'Data terkait tidak valid atau tidak ditemukan.',
                1406 => 'Data yang dimasukkan terlalu panjang untuk field yang tersedia.',
                default => 'Terjadi kesalahan dalam memproses data. Silakan periksa kembali input Anda atau hubungi administrator.',
            };

            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => [
                    'database' => [$message, $e->getMessage()], // Include actual error for debugging
                ],
            ], 422);
        });
    })->create();
