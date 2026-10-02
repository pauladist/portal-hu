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
            /*
            |--------------------------------------------------------------------------
            | Información principal
            |--------------------------------------------------------------------------
            */

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'subtitle' => [
                'nullable',
                'string',
                'max:500',
            ],

            'content' => [
                'required',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Estado
            |--------------------------------------------------------------------------
            */

            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'scheduled',
                    'published',
                ]),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            /*
            |--------------------------------------------------------------------------
            | Portada
            |--------------------------------------------------------------------------
            */

            'cover' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],

            /*
            |--------------------------------------------------------------------------
            | Categorías
            |--------------------------------------------------------------------------
            */

            'categories' => [
                'nullable',
                'array',
            ],

            'categories.*' => [
                'integer',
                'exists:categories,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Tags
            |--------------------------------------------------------------------------
            */

            'tags' => [
                'nullable',
                'array',
            ],

            'tags.*' => [
                'integer',
                'exists:tags,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Archivos insertados dentro del editor
            |--------------------------------------------------------------------------
            */

            'editor_media' => [
                'nullable',
                'array',
            ],

            'editor_media.*.id' => [
                'required',
                'string',
                'max:255',
            ],

            'editor_media.*.type' => [
                'required',
                'string',
                'max:100',
            ],

            'editor_media.*.file' => [
                'required',
                'file',
                'max:20480',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $status = $this->input('status');
            $publishedAt = $this->input('published_at');

            /*
            |--------------------------------------------------------------------------
            | Borrador
            |--------------------------------------------------------------------------
            */

            if ($status === 'draft' && $publishedAt) {
                $validator->errors()->add(
                    'published_at',
                    'Una noticia en borrador no puede tener fecha de publicación.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Programada
            |--------------------------------------------------------------------------
            */

            if ($status === 'scheduled') {
                if (!$publishedAt) {
                    $validator->errors()->add(
                        'published_at',
                        'Una noticia programada debe tener una fecha de publicación.'
                    );
                } else {
                    $scheduledAt = \Carbon\Carbon::parse($publishedAt);
                    $currentMinute = now()->startOfMinute();

                    if ($scheduledAt->lte($currentMinute)) {
                        $validator->errors()->add(
                            'published_at',
                            'Seleccioná una fecha y hora posteriores a la actual.'
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required' =>
                'El título es obligatorio.',

            'title.max' =>
                'El título no puede superar los 255 caracteres.',

            'subtitle.max' =>
                'El subtítulo no puede superar los 500 caracteres.',

            'content.required' =>
                'El contenido es obligatorio.',

            'status.required' =>
                'El estado de la noticia es obligatorio.',

            'status.in' =>
                'El estado seleccionado no es válido.',

            'published_at.date' =>
                'La fecha de publicación no es válida.',

            'cover.required' =>
                'La imagen principal es obligatoria.',

            'cover.image' =>
                'La imagen principal debe ser una imagen válida.',

            'cover.mimes' =>
                'La imagen principal debe ser JPG, JPEG, PNG o WEBP.',

            'cover.max' =>
                'La imagen principal no puede superar los 10 MB.',

            'categories.*.exists' =>
                'Una de las categorías seleccionadas no existe.',

            'tags.*.exists' =>
                'Uno de los tags seleccionados no existe.',

            'editor_media.*.file.required' =>
                'Uno de los archivos del contenido no fue recibido.',

            'editor_media.*.file.file' =>
                'Uno de los archivos del contenido no es válido.',

            'editor_media.*.file.max' =>
                'Uno de los archivos del contenido supera el tamaño máximo permitido.',
        ];
    }
}