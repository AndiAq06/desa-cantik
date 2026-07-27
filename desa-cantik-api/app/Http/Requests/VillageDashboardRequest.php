<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class VillageDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        // All authenticated users can access village dashboard
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();

        // If user is BPS Admin, village_id is optional (can view any village)
        // If user is Village Officer, village_id is ignored (can only view their own)
        if ($user && $user->role === UserRole::BPS_ADMIN) {
            return [
                'village_id' => 'sometimes|integer|exists:villages,id',
            ];
        }

        return [];
    }

    public function messages(): array
    {
        return [
            'village_id.integer' => 'Village ID must be a valid number',
            'village_id.exists' => 'The specified village does not exist',
        ];
    }

    /**
     * Get the validated village ID for the request
     */
    public function getVillageId(): ?int
    {
        $user = $this->user();

        // BPS Admin can specify village_id or get null (for overview)
        if ($user->role === UserRole::BPS_ADMIN) {
            return $this->query('village_id') ? (int) $this->query('village_id') : null;
        }

        // Village Officer can only access their own village
        return $user->village_id;
    }
}
