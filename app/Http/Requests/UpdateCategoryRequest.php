<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'title')
                    ->ignore($category->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El nombre de la categoría es obligatorio.',
            'title.max' => 'El nombre de la categoría no puede superar los 255 caracteres.',
            'title.unique' => 'Ya existe otra categoría con ese nombre.',
        ];
    }
}