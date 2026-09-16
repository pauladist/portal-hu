<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],

            'subtitle' => ['nullable', 'string', 'max:500'],

            'image' => ['nullable', 'string', 'max:255'],

            'content' => ['required', 'string'],

            'status' => [
                'required',
                Rule::in(['draft', 'scheduled', 'published']),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            'categories' => ['nullable', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],

            'tags' => ['nullable', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.max' => 'El título no puede superar los 255 caracteres.',

            'subtitle.max' => 'El subtítulo no puede superar los 500 caracteres.',

            'content.required' => 'El contenido es obligatorio.',

            'status.required' => 'El estado es obligatorio.',
            'status.in' => 'El estado seleccionado no es válido.',

            'published_at.date' => 'La fecha de publicación no es válida.',

            'categories.array' => 'Las categorías deben enviarse como una lista.',
            'categories.*.exists' => 'Una de las categorías seleccionadas no existe.',

            'tags.array' => 'Las etiquetas deben enviarse como una lista.',
            'tags.*.exists' => 'Una de las etiquetas seleccionadas no existe.',
        ];
    }
}