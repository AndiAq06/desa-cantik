<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratPengantar extends Model
{
    use HasFactory;

    protected $table = 'surat_pengantar';

    protected $fillable = [
        'village_id',
        'jenis_surat',
        'nik',
        'nama_lengkap',
        'alamat_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'pekerjaan',
        'nomor_hp',
        'email',
        'hari_pelaksanaan',
        'tanggal_kegiatan',
        'tempat_kegiatan',
        'jenis_kegiatan',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_kegiatan' => 'date',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }
}
