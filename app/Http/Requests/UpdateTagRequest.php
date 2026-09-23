<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tag = $this->route('tag');

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'title')
                    ->ignore($tag->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El nombre de la etiqueta es obligatorio.',
            'title.max' => 'El nombre de la etiqueta no puede superar los 255 caracteres.',
            'title.unique' => 'Ya existe otra etiqueta con ese nombre.',
        ];
    }
}