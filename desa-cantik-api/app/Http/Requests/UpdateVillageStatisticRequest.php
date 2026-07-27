<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVillageStatisticRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge($this->sanitizedInputs());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $maxYear = (int) date('Y') + 1;

        return [
            'module_id' => ['sometimes', 'required', 'exists:desa_modules,id'],
            'indicator_name' => ['sometimes', 'required', 'string', 'max:255'],
            'value' => ['sometimes', 'nullable', 'numeric'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:' . $maxYear],
            'source' => ['sometimes', 'nullable', 'string', 'max:255'],
            'rejection_reason' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'file' => ['sometimes', 'nullable', 'file', 'max:10240'],
            'link' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function sanitizedInputs(): array
    {
        $input = $this->all();
        $fields = ['indicator_name', 'unit', 'source'];

        foreach ($fields as $field) {
            if (array_key_exists($field, $input) && is_string($input[$field])) {
                $input[$field] = $this->cleanString($input[$field]);
            }
        }

        return $input;
    }

    protected function cleanString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $clean = trim(strip_tags($value));

        return $clean === '' ? null : $clean;
    }
}
