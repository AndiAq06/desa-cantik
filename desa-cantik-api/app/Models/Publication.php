<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Publication extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'village_id',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size_bytes',
        'published_at',
        'uploaded_by',
        'status',
        'category',
    ];

    protected $casts = [
        'published_at' => 'date',
    ];

    protected $appends = [
        'download_url',
        'view_url',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getDownloadUrlAttribute(): ?string
    {
        if (! $this->id) {
            \Log::debug('Publication download_url: No ID', ['title' => $this->title]);
            return null;
        }

        // Return the download route if a file_path is set.
        // The actual file existence check happens at download time in the controller.
        if ($this->file_path) {
            $url = route('publications.download', $this->id);
            \Log::debug('Publication download_url generated', [
                'id' => $this->id,
                'title' => $this->title,
                'file_path' => $this->file_path,
                'url' => $url,
            ]);
            return $url;
        }

        \Log::debug('Publication download_url: No file_path', [
            'id' => $this->id,
            'title' => $this->title,
            'file_path' => $this->file_path,
        ]);
        return null;
    }

    public function getViewUrlAttribute(): ?string
    {
        if (! $this->id || ! $this->file_path) {
            return null;
        }

        return route('publications.view', $this->id);
    }
}
