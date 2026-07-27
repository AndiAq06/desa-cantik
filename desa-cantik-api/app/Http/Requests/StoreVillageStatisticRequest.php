<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVillageStatisticRequest extends FormRequest
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
            'module_id' => ['required', 'exists:desa_modules,id'],
            'indicator_name' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:50'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:'.$maxYear],
            'source' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'file' => ['nullable', 'file', 'max:10240'],
            'link' => ['nullable', 'string', 'max:500'],
            'is_published' => ['nullable', 'boolean'],
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
