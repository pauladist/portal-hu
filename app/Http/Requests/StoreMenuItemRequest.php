<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
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
            ],

            'url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'order' => [
                'required',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El nombre del botón es obligatorio.',
            'title.max' => 'El nombre del botón no puede superar los 255 caracteres.',

            'url.max' => 'La URL no puede superar los 2048 caracteres.',

            'order.required' => 'El orden es obligatorio.',
            'order.integer' => 'El orden debe ser un número entero.',
            'order.min' => 'El orden no puede ser negativo.',

            'is_active.required' => 'El estado del botón es obligatorio.',
            'is_active.boolean' => 'El estado del botón no es válido.',
        ];
    }
}