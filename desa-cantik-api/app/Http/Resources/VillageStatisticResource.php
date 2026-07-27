<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VillageStatisticResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Uses snapshot columns for denormalized access to type/module data
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'village_id' => $this->village_id,
            'village' => $this->whenLoaded('village', function () {
                return [
                    'id' => $this->village?->id,
                    'name' => $this->village?->name ?? $this->village?->nama_desa,
                    'village_code' => $this->village?->village_code,
                    'code' => $this->village?->village_code,
                    'district' => $this->village?->kecamatan,
                ];
            }),
            'module_id' => $this->module_id,
            'module' => $this->whenLoaded('module', function () {
                return [
                    'id' => $this->module?->id,
                    'name' => $this->module?->module_name,
                    'module_name' => $this->module?->module_name,
                    'is_active' => $this->module?->is_active,
                ];
            }),
            'indicator_name' => $this->indicator_name,
            'title' => $this->indicator_name,
            'name' => $this->indicator_name,
            'value' => $this->value !== null ? (float) $this->value : null,
            'unit' => $this->unit,
            'year' => $this->year,
            'source' => $this->source,
            'status' => $this->status ?? 'Menunggu Validasi',
            'fileName' => $this->file_name,
            'rejection_reason' => $this->rejection_reason,
            'rejectionReason' => $this->rejection_reason,
            'file_name' => $this->file_name,
            'is_published' => (bool) ($this->is_published ?? true),
            'isPublished' => (bool) ($this->is_published ?? true),
            // Subject is from module (statistic_types removed)
            'subject' => $this->module?->module_name ?? 'Umum',
            'updatedDate' => $this->updated_at?->toISOString(),
            'created_by' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator?->id,
                    'full_name' => $this->creator?->full_name ?? $this->creator?->name,
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
