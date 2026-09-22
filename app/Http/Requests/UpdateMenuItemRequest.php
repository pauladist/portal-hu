<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $menuItem = $this->route('menu_item');

        return [
            'parent_id' => [
                'nullable',
                'integer',
                'exists:menu_items,id',
                Rule::notIn([$menuItem->id]),
            ],

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
            'parent_id.exists' => 'El menú seleccionado como padre no existe.',
            'parent_id.not_in' => 'Un botón no puede ser su propio padre.',

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