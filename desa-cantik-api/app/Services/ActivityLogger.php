<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Request as RequestFacade;

class ActivityLogger
{
    public static function log(string $action, Model $model, ?string $description = null, array $context = []): void
    {
        $request = self::currentRequest();

        ActivityLog::create([
            'user_id' => $context['user_id'] ?? auth()->id(),
            'village_id' => $villageId = $context['village_id'] ?? self::resolveVillageId($model),
            'action' => $action,
            'model_type' => $model::class,
            'model_id' => $model->getKey(),
            'description' => $description,
            'old_data' => $context['old_data'] ?? null,
            'new_data' => $context['new_data'] ?? null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);

        self::clearDashboardCaches($villageId);
    }

    protected static function resolveVillageId(Model $model): ?int
    {
        $vid = $model->getAttribute('village_id');
        if ($vid) {
            return (int) $vid;
        }

        if (method_exists($model, 'village') && $model->relationLoaded('village')) {
            return $model->village?->id;
        }

        return null;
    }

    protected static function currentRequest(): ?Request
    {
        return RequestFacade::instance();
    }

    protected static function clearDashboardCaches(?int $villageId): void
    {
        Cache::forget('dashboard:admin');
        Cache::forget('dashboard:public');

        if ($villageId) {
            Cache::forget("dashboard:village:{$villageId}");
        }
    }
}
