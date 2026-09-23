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

            'destination_type' => [
                'nullable',
                Rule::in(['url', 'pdf']),
            ],

            'url' => [
                'nullable',
                'url',
                'max:2048',
            ],

            'file' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240',
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $type = $this->input('destination_type');

            if ($type === 'url' && !$this->filled('url')) {
                $validator->errors()->add(
                    'url',
                    'Debe ingresar una URL para este tipo de destino.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | El PDF es opcional al editar
            |--------------------------------------------------------------------------
            |
            | Si ya existe un PDF y solamente se está editando el nombre,
            | no es necesario volver a subirlo.
            |
            */

            if (
                $type === 'pdf' &&
                !$this->hasFile('file')
            ) {
                $menuItem = $this->route('menu_item');

                if (!$menuItem || !$menuItem->file_path) {
                    $validator->errors()->add(
                        'file',
                        'Debe seleccionar un archivo PDF.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'parent_id.exists' => 'El menú seleccionado como padre no existe.',
            'parent_id.not_in' => 'Un botón no puede ser su propio padre.',

            'title.required' => 'El nombre del botón es obligatorio.',
            'title.max' => 'El nombre del botón no puede superar los 255 caracteres.',

            'destination_type.in' => 'El tipo de destino seleccionado no es válido.',

            'url.url' => 'La URL ingresada no es válida.',
            'url.max' => 'La URL no puede superar los 2048 caracteres.',

            'file.file' => 'El archivo seleccionado no es válido.',
            'file.mimes' => 'El archivo debe ser un PDF.',
            'file.max' => 'El archivo no puede superar los 10 MB.',

            'order.required' => 'El orden es obligatorio.',
            'order.integer' => 'El orden debe ser un número entero.',
            'order.min' => 'El orden no puede ser negativo.',

            'is_active.required' => 'El estado del botón es obligatorio.',
            'is_active.boolean' => 'El estado del botón no es válido.',
        ];
    }
}