<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTagRequest extends FormRequest
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
                'unique:tags,title',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El nombre de la etiqueta es obligatorio.',
            'title.max' => 'El nombre de la etiqueta no puede superar los 255 caracteres.',
            'title.unique' => 'Ya existe una etiqueta con ese nombre.',
        ];
    }
}