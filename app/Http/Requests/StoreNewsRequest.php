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
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'subtitle' => [
                'nullable',
                'string',
                'max:255',
            ],

            'content' => [
                'required',
                'string',
            ],

            'status' => [
                'required',
                Rule::in(['draft', 'scheduled', 'published']),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            'categories' => [
                'nullable',
                'array',
            ],

            'categories.*' => [
                'integer',
                'exists:categories,id',
            ],

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
            | Medios
            |--------------------------------------------------------------------------
            */

            'media' => [
                'required',
                'array',
                'min:1',
            ],

            'media.*.type' => [
                'required',
                Rule::in(['image', 'pdf', 'video']),
            ],

            'media.*.title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'media.*.is_featured' => [
                'nullable',
                'boolean',
            ],

            'media.*.order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'media.*.file' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,webp,pdf',
                'max:10240',
            ],

            'media.*.url' => [
                'nullable',
                'url',
                'max:2048',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $media = $this->input('media', []);

            /*
        |--------------------------------------------------------------------------
        | Validar imagen principal
        |--------------------------------------------------------------------------
        */

            $featuredImages = collect($media)
                ->filter(function ($item) {
                    return ($item['type'] ?? null) === 'image'
                        && filter_var(
                            $item['is_featured'] ?? false,
                            FILTER_VALIDATE_BOOLEAN
                        );
                });

            if ($featuredImages->count() !== 1) {
                $validator->errors()->add(
                    'media',
                    'La noticia debe tener exactamente una imagen principal.'
                );
            }

            /*
        |--------------------------------------------------------------------------
        | Validar archivos y videos
        |--------------------------------------------------------------------------
        */

            foreach ($media as $index => $item) {

                $type = $item['type'] ?? null;

                if ($type === 'image' || $type === 'pdf') {
                    if (!isset($item['file']) || !$item['file']) {
                        $validator->errors()->add(
                            "media.$index.file",
                            'Este medio requiere un archivo.'
                        );
                    }
                }

                if ($type === 'video') {
                    if (empty($item['url'])) {
                        $validator->errors()->add(
                            "media.$index.url",
                            'El video requiere una URL.'
                        );
                    }
                }

                if (
                    ($item['is_featured'] ?? false)
                    && $type !== 'image'
                ) {
                    $validator->errors()->add(
                        "media.$index.is_featured",
                        'Solo una imagen puede ser marcada como principal.'
                    );
                }
            }

            /*
        |--------------------------------------------------------------------------
        | Validar fecha según estado
        |--------------------------------------------------------------------------
        */

            $status = $this->input('status');
            $publishedAt = $this->input('published_at');

            if ($status === 'scheduled') {

                if (!$publishedAt) {

                    $validator->errors()->add(
                        'published_at',
                        'Una noticia programada debe tener una fecha de publicación.'
                    );
                } elseif (strtotime($publishedAt) <= now()->timestamp) {

                    $validator->errors()->add(
                        'published_at',
                        'La fecha de publicación debe ser futura.'
                    );
                }
            }

            if ($status === 'draft' && $publishedAt) {

                $validator->errors()->add(
                    'published_at',
                    'Una noticia en borrador no puede tener fecha de publicación.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.max' => 'El título no puede superar los 255 caracteres.',

            'content.required' => 'El contenido es obligatorio.',

            'status.required' => 'El estado es obligatorio.',
            'status.in' => 'El estado seleccionado no es válido.',

            'published_at.date' => 'La fecha de publicación no es válida.',

            'categories.*.exists' => 'Una de las categorías seleccionadas no existe.',
            'tags.*.exists' => 'Una de las etiquetas seleccionadas no existe.',

            'media.required' => 'La noticia debe tener una imagen principal.',
            'media.min' => 'La noticia debe tener al menos un medio.',

            'media.*.type.required' => 'Cada medio debe tener un tipo.',
            'media.*.type.in' => 'El tipo de medio no es válido.',

            'media.*.file.file' => 'El archivo enviado no es válido.',
            'media.*.file.mimes' => 'El archivo debe ser una imagen o un PDF.',
            'media.*.file.max' => 'El archivo no puede superar los 10 MB.',

            'media.*.url.url' => 'La URL del video no es válida.',
        ];
    }
}
