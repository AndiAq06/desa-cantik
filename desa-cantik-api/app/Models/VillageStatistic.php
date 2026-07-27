<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VillageStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'module_id',
        'indicator_name',
        'value',
        'unit',
        'year',
        'source',
        'status',
        'file_name',
        'rejection_reason',
        'created_by',
        'is_published',
    ];

    protected $casts = [
        'value' => 'decimal:4',
        'year' => 'integer',
        'is_published' => 'boolean',
    ];

    /**
     * Validate data integrity on save
     */
    protected static function booted(): void
    {
        static::saving(function (VillageStatistic $stat) {
            // Validate transitive redundancy: module must belong to the same village
            if ($stat->module_id && $stat->village_id) {
                $module = Module::find($stat->module_id);
                
                if ($module && $module->village_id !== $stat->village_id) {
                    throw new \RuntimeException(
                        sprintf(
                            'Module ID %d belongs to village ID %d, but statistic is assigned to village ID %d. '
                            . 'Cannot create/update statistic with mismatched village.',
                            $stat->module_id,
                            $module->village_id,
                            $stat->village_id
                        )
                    );
                }
            }
        });
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }


    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
