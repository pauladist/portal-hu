<?php

namespace App\Http\Requests;

use App\Models\InstitutionalPage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => [
                'nullable',
                'integer',
                'exists:menu_items,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'destination_type' => [
                'nullable',
                Rule::in(['url', 'pdf', 'page']),
            ],

            'url' => [
                'nullable',
                'max:2048',
                // Acepta URLs completas o rutas internas del portal (ej: /noticias)
                function ($attribute, $value, $fail) {
                    $isInternalPath = preg_match('#^/(?!/)\S*$#', (string) $value);

                    if (!$isInternalPath && !filter_var($value, FILTER_VALIDATE_URL)) {
                        $fail('La URL ingresada no es válida.');
                    }
                },
            ],

            'file' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240',
            ],

            'page_id' => [
                'nullable',
                'integer',
                'exists:institutional_pages,id',
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

            'is_quick_link' => [
                'required',
                'boolean',
            ],

            'quick_link_order' => [
                'nullable',
                'integer',
                'min:1',
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

            if ($type === 'pdf' && !$this->hasFile('file')) {
                $validator->errors()->add(
                    'file',
                    'Debe seleccionar un archivo PDF para este tipo de destino.'
                );
            }

            if ($type === 'page') {
                $pageId = $this->input('page_id');

                if (!$pageId) {
                    $validator->errors()->add(
                        'page_id',
                        'Debe seleccionar una página institucional.'
                    );

                    return;
                }

                $pageExists = InstitutionalPage::query()
                    ->where('id', $pageId)
                    ->where('status', 'published')
                    ->exists();

                if (!$pageExists) {
                    $validator->errors()->add(
                        'page_id',
                        'La página institucional seleccionada no está publicada.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'parent_id.exists' => 'El menú seleccionado como padre no existe.',
            'title.required' => 'El nombre del botón es obligatorio.',
            'title.max' => 'El nombre del botón no puede superar los 255 caracteres.',

            'destination_type.in' => 'El tipo de destino seleccionado no es válido.',

            'url.url' => 'La URL ingresada no es válida.',
            'url.max' => 'La URL no puede superar los 2048 caracteres.',

            'file.file' => 'El archivo seleccionado no es válido.',
            'file.mimes' => 'El archivo debe ser un PDF.',
            'file.max' => 'El archivo no puede superar los 10 MB.',

            'page_id.exists' => 'La página institucional seleccionada no existe.',

            'order.required' => 'El orden es obligatorio.',
            'order.integer' => 'El orden debe ser un número entero.',
            'order.min' => 'El orden no puede ser negativo.',

            'is_active.required' => 'El estado del botón es obligatorio.',
            'is_active.boolean' => 'El estado del botón no es válido.',
        ];
    }
}