<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VillageResource extends JsonResource
{
    protected bool $includeDetails;

    public function __construct($resource, bool $includeDetails = false)
    {
        parent::__construct($resource);
        $this->includeDetails = $includeDetails;
    }

    /**
     * Transform the resource into an array.
     * Uses denormalized village fields directly (no profile relationship needed)
     */
    public function toArray(Request $request): array
    {
        $rawLogoUrl = $this->logo_url;
        $logoUrl = $this->formatStorageUrl($rawLogoUrl);
        // Use logo_url for all image fields, with placeholder fallback
        $imageUrl = $logoUrl ?? 'https://placehold.co/800x600/1C6EA4/FFFFFF?text=Desa+Cantik';

        $data = [
            'id' => (string) $this->id,
            'village_id' => (int) $this->id,
            'village_code' => $this->village_code,
            'code' => $this->village_code,
            'name' => $this->name,
            'district' => $this->kecamatan,
            'kecamatan' => $this->kecamatan,
            'subdistrict' => $this->kabupaten,
            'regency' => $this->kabupaten,
            'province' => 'Sulawesi Selatan', // Hardcoded - all villages in Toraja Utara
            'population' => (int) ($this->population ?? 0),
            'area' => (float) ($this->area ?? 0),
            'logo_url' => $logoUrl,
            'photo_url' => $logoUrl,
            'thumbnail_url' => $imageUrl,
            'image' => $imageUrl,
            'image_url' => $imageUrl,
            'is_active' => (bool) $this->is_visible,
            'status' => $this->is_visible ? 'Aktif' : 'Tidak Aktif',
            'has_layanan_online' => (bool) $this->has_layanan_online,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if ($this->includeDetails) {
            $data['description'] = $this->deskripsi;
            $data['deskripsi'] = $this->deskripsi;
            $data['vision'] = $this->visi;
            $data['mission'] = $this->misi ? json_decode($this->misi, true) : [];
        }

        return $data;
    }

    private function formatStorageUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (preg_match_all('#https?://#i', $url, $matches, PREG_OFFSET_CAPTURE) > 1 && isset($matches[0][1][1])) {
            $url = substr($url, $matches[0][1][1]);
        }

        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $path = ltrim($path, '/');

        if ($path === '') {
            return null;
        }

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        } elseif (str_starts_with($path, 'public/')) {
            $path = substr($path, strlen('public/'));
        }

        return rtrim(config('app.url'), '/').'/storage/'.ltrim($path, '/');
    }
}
