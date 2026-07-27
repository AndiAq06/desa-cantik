<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $table = 'desa_modules';

    protected $fillable = [
        'module_name',
        'description',
        'unit',
        'is_active',
        'village_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Menyatakan bahwa modul milik desa
    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    // Relasi ke data statistik yang terhubung dengan modul ini
    public function statistics(): HasMany
    {
        return $this->hasMany(VillageStatistic::class, 'module_id');
    }

    // Scope untuk filter modul bertipe statistik
    public function scopeStatisticModules($query)
    {
        return $query->where('module_name', 'like', '%Statistik%');
    }

    // Scope untuk filter modul yang aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
