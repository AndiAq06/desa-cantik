<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to ensure Perangkat Desa can only access their own desa data
 * Implements Non-Functional Requirement 8 & 9
 */
class CheckDesaOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admin BPS can access all desa
        if ($user->hasRole('admin_bps')) {
            return $next($request);
        }

        // Perangkat Desa must have desa_id
        if ($user->hasRole('perangkat_desa')) {

            // Check if route has desa_id parameter
            $routeDesaId = $request->route('desa_id');

            if ($routeDesaId) {
                // Verify user can only access their own desa
                if ($user->desa_id != $routeDesaId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied. You can only access data from your own desa.',
                    ], 403);
                }
            }

            // For non-parameterized routes, inject user's desa_id into request
            $request->merge(['desa_id' => $user->desa_id]);
        }

        // Masyarakat should not access protected desa endpoints
        if ($user->hasRole('masyarakat')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
