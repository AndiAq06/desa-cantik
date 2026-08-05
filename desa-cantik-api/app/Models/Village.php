<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Village model - now contains all profile data (denormalized)
 */
class Village extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'villages';

    protected $fillable = [
        'village_code',
        'name',
        'kecamatan',
        'kabupaten',
        'is_visible',
        'deskripsi',
        'area',
        'population',
        'logo_url',
        'has_layanan_online',
        'visi',
        'misi',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'area' => 'float',
        'population' => 'integer',
        'has_layanan_online' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'village_id');
    }

    public function statistics(): HasMany
    {
        return $this->hasMany(VillageStatistic::class, 'village_id');
    }

    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class, 'village_id');
    }

    public function thematicMaps(): HasMany
    {
        return $this->hasMany(ThematicMap::class, 'village_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class, 'village_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'village_id');
    }

    public function suratPengantars(): HasMany
    {
        return $this->hasMany(SuratPengantar::class, 'village_id');
    }

    public function pengaduans(): HasMany
    {
        return $this->hasMany(Pengaduan::class, 'village_id');
    }

    public function bukuTamus(): HasMany
    {
        return $this->hasMany(BukuTamu::class, 'village_id');
    }
}
