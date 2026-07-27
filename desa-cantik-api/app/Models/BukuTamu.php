<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BukuTamu extends Model
{
    use HasFactory;

    protected $table = 'buku_tamu';

    protected $fillable = [
        'village_id',
        'nama_lengkap',
        'jabatan',
        'asal_instansi',
        'tanggal_kunjungan',
        'keperluan',
        'tanda_tangan_path',
    ];

    protected $casts = [
        'tanggal_kunjungan' => 'datetime',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }
}
