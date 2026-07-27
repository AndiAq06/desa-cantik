<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'published_at' => 'sometimes|date|before_or_equal:today',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
        ];
    }
}
