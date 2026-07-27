<?php

namespace App\Providers;

use App\Models\Publication;
use App\Observers\PublicationObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Route::bind('village', function ($value) {
            if (is_numeric($value)) {
                return (int) $value;
            }
            $village = \App\Models\Village::whereRaw("LOWER(REPLACE(name, ' ', '-')) = ?", [strtolower($value)])
                ->orWhere('name', $value)
                ->first();
            return $village ? $village->id : $value;
        });

        Publication::observe(PublicationObserver::class);

        // Rate limiting for imports - 5 requests per hour
        RateLimiter::for('imports', function ($request) {
            return Limit::perHour(5)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak permintaan import. Silakan coba lagi nanti.',
                    ], 429);
                });
        });

        // Rate limiting for exports - 10 requests per hour
        RateLimiter::for('exports', function ($request) {
            return Limit::perHour(10)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak permintaan export. Silakan coba lagi nanti.',
                    ], 429);
                });
        });
    }
}
