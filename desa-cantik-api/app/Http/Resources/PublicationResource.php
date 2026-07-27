<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicationResource extends JsonResource
{
    public function toArray($request): array
    {
        $publishedAt = $this->published_at;
        // Publications don't have a cover image stored - use placeholder with title
        $imageUrl = 'https://placehold.co/300x400/BFDBFE/1E3A8A?text=' . urlencode($this->title ?? 'Publication');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'category' => $this->category,
            
            // Date fields - both camelCase and snake_case for frontend compatibility
            'publishedAt' => $publishedAt?->toDateString(),
            'published_at' => $publishedAt?->toDateString(),
            'date' => $publishedAt?->toDateString(),
            'year' => $publishedAt?->year,
            'month' => $publishedAt?->month,
            
            // File metadata - both camelCase and snake_case
            'fileName' => $this->file_name,
            'file_name' => $this->file_name,
            'fileSize' => $this->file_size_bytes,
            'file_size_bytes' => $this->file_size_bytes,
            'fileType' => $this->file_type,
            'file_type' => $this->file_type,
            'filePath' => $this->file_path,
            'file_path' => $this->file_path,
            
            // URL fields - all variants for frontend compatibility
            'fileUrl' => $this->download_url,
            'file_url' => $this->download_url,
            'downloadUrl' => $this->download_url,
            'download_url' => $this->download_url,
            'viewUrl' => $this->view_url,
            'view_url' => $this->view_url,
            
            // Image/cover fields
            'imageUrl' => $imageUrl,
            'cover_url' => $imageUrl,
            'thumbnail_url' => $imageUrl,
            
            // Relationships
            'uploaded_by' => $this->whenLoaded('uploader', function () {
                return [
                    'id' => $this->uploader?->id,
                    'full_name' => $this->uploader?->full_name,
                    'name' => $this->uploader?->full_name,
                ];
            }),
            'uploader' => $this->whenLoaded('uploader', function () {
                return [
                    'id' => $this->uploader?->id,
                    'full_name' => $this->uploader?->full_name,
                    'name' => $this->uploader?->full_name,
                ];
            }),
            'village' => $this->whenLoaded('village', function () {
                return [
                    'id' => $this->village?->id,
                    'name' => $this->village?->name ?? $this->village?->nama_desa,
                    'code' => $this->village?->village_code,
                    'village_code' => $this->village?->village_code,
                ];
            }),
            'villageName' => $this->village?->name,
            
            // Timestamps
            'created_at' => optional($this->created_at)->toISOString(),
            'createdAt' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'updatedAt' => optional($this->updated_at)->toISOString(),
        ];
    }
}
