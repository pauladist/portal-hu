<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
                'unique:categories,title',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El nombre de la categoría es obligatorio.',
            'title.max' => 'El nombre de la categoría no puede superar los 255 caracteres.',
            'title.unique' => 'Ya existe una categoría con ese nombre.',
        ];
    }
}