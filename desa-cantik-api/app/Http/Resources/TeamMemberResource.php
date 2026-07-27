<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'photo_url' => $this->photo_url,
            'photoUrl' => $this->photo_url, // Frontend alias
            'email' => $this->email,
            'phone' => $this->phone,
            'display_order' => $this->display_order,
            'displayOrder' => $this->display_order, // Frontend alias
            'is_active' => $this->is_active,
            'isActive' => $this->is_active, // Frontend alias
            'created_at' => $this->created_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(), // Frontend alias
            'updated_at' => $this->updated_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(), // Frontend alias
        ];
    }
}
