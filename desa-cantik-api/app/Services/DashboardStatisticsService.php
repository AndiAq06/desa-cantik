<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Publication;
use App\Models\User;
use App\Models\Village;
use App\Models\VillageStatistic;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DashboardStatisticsService
{
    public function getAdminDashboard(): array
    {
        $ttl = config('dashboard.cache_ttl');
        $callback = function () {
            return [
                'summary' => $this->adminSummary(),
                'publication_status' => $this->publicationStatus(),
                'publication_categories' => $this->publicationCategories(),
                'recent_activities' => $this->recentActivities(),
                'villages_statistics' => $this->villageStatisticsOverview(),
                'monthly_activities' => $this->monthlyActivities(),
            ];
        };

        return $ttl > 0 ? Cache::remember('dashboard:admin', $ttl, $callback) : $callback();
    }

    public function getVillageDashboard(User $user, ?int $villageId = null): array
    {
        $targetVillageId = $villageId ?? $user->village_id;

        if (! $targetVillageId) {
            throw new RuntimeException('Village context is required.');
        }

        $cacheKey = sprintf('dashboard:village:%d', $targetVillageId);
        $ttl = config('dashboard.cache_ttl');

        $callback = function () use ($targetVillageId) {
            // Load village directly (profile fields are now in villages table)
            $village = Village::findOrFail($targetVillageId);

            return [
                'village' => [
                    'id' => $village->id,
                    'name' => $village->name,
                    'code' => $village->village_code,
                ],
                'summary' => $this->villageSummary($village),
                'recent_activities' => $this->recentActivities($village->id),
                'statistics_by_category' => $this->statisticsByCategory($village),
                'publication_status' => $this->publicationStatusByVillage($village->id),
                'profile_completeness' => $this->profileCompleteness($village),
            ];
        };

        return $ttl > 0 ? Cache::remember($cacheKey, $ttl, $callback) : $callback();
    }

    public function getPublicDashboard(): array
    {
        $ttl = config('dashboard.cache_ttl');
        $callback = function () {
            return [
                'summary' => $this->publicSummary(),
                'latest_publications' => $this->latestPublications(),
                'statistics_overview' => [], // Feature removed - statistic_types table dropped
            ];
        };

        return $ttl > 0 ? Cache::remember('dashboard:public', $ttl, $callback) : $callback();
    }

    protected function adminSummary(): array
    {
        $totalVillages = Village::count();
        $activeVillages = Village::where('is_visible', true)->count();
        $inactiveVillages = $totalVillages - $activeVillages;

        // OPTIMIZATION: Use role column directly - no more JOIN needed
        $roleCounts = User::query()
            ->selectRaw("
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'bps_admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'village_officer' THEN 1 ELSE 0 END) as officer_count,
                SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as active_users
            ")
            ->first();

        return [
            'total_villages' => $totalVillages,
            'active_villages' => $activeVillages,
            'inactive_villages' => $inactiveVillages,
            'total_users' => (int) $roleCounts->total_users,
            'admin_count' => (int) $roleCounts->admin_count,
            'village_officer_count' => (int) $roleCounts->officer_count,
            'active_users' => (int) $roleCounts->active_users,
            'total_statistics' => VillageStatistic::count(),
            'total_publications' => Publication::count(),
            'total_thematic_maps' => DB::table('thematic_maps')->count(),
        ];
    }

    protected function recentActivities(?int $villageId = null): array
    {
        return ActivityLog::query()
            ->when($villageId, fn ($query) => $query->where('village_id', $villageId))
            ->orderByDesc('created_at')
            ->limit(10)
            ->with('user:id,full_name,username')
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'user' => $log->user?->full_name ?? $log->user?->username ?? 'System',
                'action' => $log->action,
                'description' => $log->description,
                'timestamp' => $log->created_at?->toISOString(),
            ])
            ->toArray();
    }

    protected function villageStatisticsOverview(): array
    {
        $villages = Village::query()
            ->select(['id', 'name'])
            ->withCount(['statistics', 'publications'])
            ->withMax('statistics', 'updated_at')
            ->withMax('publications', 'updated_at')
            ->orderByDesc('statistics_count')
            ->limit(10)
            ->get();

        return $villages->map(function (Village $village) {
            $statisticsUpdatedAt = $village->statistics_max_updated_at;
            $publicationsUpdatedAt = $village->publications_max_updated_at;
            $lastUpdated = collect([$statisticsUpdatedAt, $publicationsUpdatedAt])
                ->filter()
                ->map(fn ($value) => Carbon::parse($value))
                ->max();

            return [
                'village_name' => $village->name,
                'statistics_count' => $village->statistics_count,
                'publications_count' => $village->publications_count,
                'last_updated' => $lastUpdated?->toISOString(),
            ];
        })->toArray();
    }

    protected function monthlyActivities(): array
    {
        $statisticModel = addslashes(VillageStatistic::class);
        $publicationModel = addslashes(Publication::class);

        // Use database-agnostic date formatting
        $dateFormat = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $rows = ActivityLog::query()
            ->selectRaw("{$dateFormat} as month")
            ->selectRaw("SUM(CASE WHEN model_type = '{$statisticModel}' AND action = 'create' THEN 1 ELSE 0 END) as statistics_created")
            ->selectRaw("SUM(CASE WHEN model_type = '{$statisticModel}' AND action = 'update' THEN 1 ELSE 0 END) as statistics_updated")
            ->selectRaw("SUM(CASE WHEN model_type = '{$publicationModel}' AND action = 'create' THEN 1 ELSE 0 END) as publications_uploaded")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return $rows->map(fn ($row) => [
            'month' => $row->month,
            'statistics_created' => (int) $row->statistics_created,
            'statistics_updated' => (int) $row->statistics_updated,
            'publications_uploaded' => (int) $row->publications_uploaded,
        ])->toArray();
    }

    protected function villageSummary(Village $village): array
    {
        $currentYear = now()->year;
        $villageId = $village->id;

        // Query 1: Statistics (total, this year, latest update)
        $statsSummary = DB::table('village_statistics')
            ->where('village_id', $villageId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN year = ? THEN 1 ELSE 0 END) as this_year,
                MAX(updated_at) as latest_update
            ", [$currentYear])
            ->first();

        // Query 2: Publications (total, this year, latest update)
        $pubsSummary = DB::table('publications')
            ->where('village_id', $villageId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN YEAR(published_at) = ? THEN 1 ELSE 0 END) as this_year,
                MAX(updated_at) as latest_update
            ", [$currentYear])
            ->first();

        // Query 3: Thematic maps (now includes features count from JSON)
        $mapsSummary = DB::table('thematic_maps')
            ->where('village_id', $villageId)
            ->selectRaw("COUNT(*) as total_maps, MAX(updated_at) as latest_update")
            ->first();

        // Count features in GeoJSON (sum of features array lengths)
        // This is a simplification - in production may want to cache this
        $totalMapPoints = DB::table('thematic_maps')
            ->where('village_id', $villageId)
            ->whereNotNull('features')
            ->get()
            ->sum(function ($map) {
                $features = json_decode($map->features, true);

                return count($features['features'] ?? []);
            });

        // Compute latest update across all three sources
        $latestUpdate = collect([
            $statsSummary->latest_update ?? null,
            $pubsSummary->latest_update ?? null,
            $mapsSummary->latest_update ?? null,
        ])
            ->filter()
            ->map(fn ($timestamp) => Carbon::parse($timestamp))
            ->max();

        return [
            'total_statistics' => (int) ($statsSummary->total ?? 0),
            'statistics_this_year' => (int) ($statsSummary->this_year ?? 0),
            'total_publications' => (int) ($pubsSummary->total ?? 0),
            'publications_this_year' => (int) ($pubsSummary->this_year ?? 0),
            'thematic_maps' => (int) ($mapsSummary->total_maps ?? 0),
            'map_points' => $totalMapPoints,
            'last_update' => $latestUpdate?->toISOString(),
        ];
    }

    protected function statisticsByCategory(Village $village): array
    {
        // Group by module_name from desa_modules table
        // This matches the "Subjek" column shown in the statistics data table
        $rows = $village->statistics()
            ->selectRaw('COALESCE(desa_modules.module_name, "Umum") as category, COUNT(*) as count')
            ->leftJoin('desa_modules', 'desa_modules.id', '=', 'village_statistics.module_id')
            ->groupByRaw('COALESCE(desa_modules.module_name, "Umum")')
            ->get();

        return $rows->map(fn ($row) => [
            'category' => $row->category,
            'count' => (int) $row->count,
        ])->toArray();
    }

    /**
     * Profile completeness now checks Village directly (denormalized)
     */
    protected function profileCompleteness(Village $village): array
    {
        $requiredFields = config('dashboard.profile_required_fields');
        $missing = [];

        foreach ($requiredFields as $field) {
            if (empty($village->{$field})) {
                $missing[] = $field;
            }
        }

        $filled = count($requiredFields) - count($missing);
        $percentage = count($requiredFields) > 0
            ? (int) round(($filled / count($requiredFields)) * 100)
            : 100;

        return [
            'percentage' => $percentage,
            'missing_fields' => $missing,
        ];
    }

    protected function publicSummary(): array
    {
        return [
            'total_villages' => Village::count(),
            'total_statistics' => VillageStatistic::count(),
            'total_publications' => Publication::count(),
            'last_updated' => ($date = VillageStatistic::max('updated_at')) ? Carbon::parse($date)->toISOString() : null,
            'last_update' => ($date = VillageStatistic::max('updated_at')) ? Carbon::parse($date)->toISOString() : null,
        ];
    }

    protected function latestPublications(): array
    {
        return Publication::query()
            ->with('village:id,name')
            ->orderByDesc('published_at')
            ->limit(5)
            ->get()
            ->map(fn (Publication $publication) => [
                'id' => $publication->id,
                'title' => $publication->title,
                'village_name' => $publication->village?->name,
                'published_at' => optional($publication->published_at)->toDateString(),
                'download_url' => $publication->download_url,
            ])
            ->toArray();
    }



    protected function publicationStatus(): array
    {
        return Publication::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => (int) $item->count,
                    'color' => $this->getStatusColor($item->status),
                ];
            })
            ->toArray();
    }

    protected function publicationCategories(): array
    {
        // Use category column which contains values like "Laporan Statistik", "Profil Desa", etc.
        return Publication::query()
            ->selectRaw('COALESCE(category, "Umum") as category, COUNT(*) as count')
            ->groupByRaw('COALESCE(category, "Umum")')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'count' => (int) $item->count,
                    'color' => $this->getCategoryColorForPublication($item->category),
                ];
            })
            ->toArray();
    }

    protected function getStatusColor(string $status): string
    {
        return match ($status) {
            'Terverifikasi' => '#22c55e',
            'Perlu Validasi' => '#f59e0b',
            'Draft' => '#6b7280',
            'Batal Terbit' => '#ef4444',
            default => '#6b7280',
        };
    }

    protected function getCategoryColor(string $category): string
    {
        $colors = [
            'Demografi' => '#22c55e',
            'Ekonomi' => '#3b82f6',
            'Pendidikan' => '#f59e0b',
            'Kesehatan' => '#14b8a6',
            'Pertanian' => '#8b5cf6',
            'Pemerintahan' => '#f97316',
        ];

        return $colors[$category] ?? '#6b7280';
    }

    protected function getCategoryColorForPublication(string $category): string
    {
        $colors = [
            'Laporan Statistik' => '#3b82f6',  // Blue
            'Profil Desa' => '#22c55e',        // Green
            'Infografis' => '#f59e0b',         // Amber
            'Berita Resmi' => '#8b5cf6',       // Purple
            'Umum' => '#6b7280',               // Gray
        ];

        return $colors[$category] ?? '#14b8a6'; // Default teal
    }

    protected function publicationStatusByVillage(int $villageId): array
    {
        return Publication::query()
            ->where('village_id', $villageId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => (int) $item->count,
                    'color' => $this->getStatusColor($item->status),
                ];
            })
            ->toArray();
    }

    protected function formatFileType(?string $fileType): string
    {
        if (!$fileType) {
            return 'Lainnya';
        }

        // Map MIME types to readable labels
        return match (true) {
            str_contains($fileType, 'pdf') => 'PDF',
            str_contains($fileType, 'image') => 'Gambar',
            str_contains($fileType, 'spreadsheet') || str_contains($fileType, 'excel') => 'Spreadsheet',
            str_contains($fileType, 'document') || str_contains($fileType, 'word') => 'Dokumen',
            str_contains($fileType, 'presentation') || str_contains($fileType, 'powerpoint') => 'Presentasi',
            default => 'Lainnya',
        };
    }

    protected function getFileTypeColor(?string $fileType): string
    {
        if (!$fileType) {
            return '#6b7280';
        }

        return match (true) {
            str_contains($fileType, 'pdf') => '#ef4444',
            str_contains($fileType, 'image') => '#22c55e',
            str_contains($fileType, 'spreadsheet') || str_contains($fileType, 'excel') => '#3b82f6',
            str_contains($fileType, 'document') || str_contains($fileType, 'word') => '#8b5cf6',
            str_contains($fileType, 'presentation') || str_contains($fileType, 'powerpoint') => '#f97316',
            default => '#6b7280',
        };
    }
}
