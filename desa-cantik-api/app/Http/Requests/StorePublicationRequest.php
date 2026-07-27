<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'published_at' => 'required|date|before_or_equal:today',
            'file' => 'required|file|mimes:pdf,doc,docx|max:204800', // 200MB
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
        ];
    }
}
