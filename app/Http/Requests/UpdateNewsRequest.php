<?php

namespace App\Http\Requests;

use App\Models\News;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNewsRequest extends FormRequest
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
            | Noticia
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

            /*
            |--------------------------------------------------------------------------
            | Categorías y etiquetas
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
            | Medios existentes
            |--------------------------------------------------------------------------
            */

            'existing_media' => [
                'nullable',
                'array',
            ],

            'existing_media.*.id' => [
                'required',
                'integer',
            ],

            'existing_media.*.title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'existing_media.*.is_featured' => [
                'nullable',
                'boolean',
            ],

            'existing_media.*.order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | Reemplazar archivos existentes
            |--------------------------------------------------------------------------
            */

            'existing_media.*.file' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,webp,pdf',
                'max:10240',
            ],

            /*
            |--------------------------------------------------------------------------
            | Medios nuevos
            |--------------------------------------------------------------------------
            */

            'new_media' => [
                'nullable',
                'array',
            ],

            'new_media.*.type' => [
                'required',
                Rule::in(['image', 'pdf', 'video']),
            ],

            'new_media.*.title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'new_media.*.is_featured' => [
                'nullable',
                'boolean',
            ],

            'new_media.*.order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'new_media.*.file' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,webp,pdf',
                'max:10240',
            ],

            'new_media.*.url' => [
                'nullable',
                'url',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | Medios eliminados
            |--------------------------------------------------------------------------
            */

            'deleted_media' => [
                'nullable',
                'array',
            ],

            'deleted_media.*' => [
                'integer',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $news = $this->route('news');

            if (!$news instanceof News) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Verificar que los medios pertenezcan a esta noticia
            |--------------------------------------------------------------------------
            */

            $newsMediaIds = $news->media()
                ->pluck('id')
                ->toArray();

            foreach ($this->input('existing_media', []) as $index => $media) {

                $mediaId = $media['id'] ?? null;

                if (!in_array($mediaId, $newsMediaIds)) {
                    $validator->errors()->add(
                        "existing_media.$index.id",
                        'El medio seleccionado no pertenece a esta noticia.'
                    );
                }
            }

            foreach ($this->input('deleted_media', []) as $index => $mediaId) {

                if (!in_array($mediaId, $newsMediaIds)) {
                    $validator->errors()->add(
                        "deleted_media.$index",
                        'El medio seleccionado no pertenece a esta noticia.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Medios existentes que permanecen
            |--------------------------------------------------------------------------
            */

            $deletedMedia = collect(
                $this->input('deleted_media', [])
            );

            $existingMedia = collect(
                $this->input('existing_media', [])
            )->filter(function ($media) use ($deletedMedia) {
                return !$deletedMedia->contains($media['id'] ?? null);
            });

            /*
            |--------------------------------------------------------------------------
            | Imagen principal
            |--------------------------------------------------------------------------
            */

            $featuredCount = 0;

            foreach ($existingMedia as $mediaData) {

                $media = $news->media()
                    ->where('id', $mediaData['id'])
                    ->first();

                if (!$media) {
                    continue;
                }

                if (
                    $media->type === 'image' &&
                    filter_var(
                        $mediaData['is_featured'] ?? false,
                        FILTER_VALIDATE_BOOLEAN
                    )
                ) {
                    $featuredCount++;
                }

                if (
                    $media->type !== 'image' &&
                    filter_var(
                        $mediaData['is_featured'] ?? false,
                        FILTER_VALIDATE_BOOLEAN
                    )
                ) {
                    $validator->errors()->add(
                        "existing_media",
                        'Solo una imagen puede ser marcada como principal.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Medios nuevos
            |--------------------------------------------------------------------------
            */

            foreach ($this->input('new_media', []) as $index => $media) {

                $type = $media['type'] ?? null;

                if ($type === 'image' || $type === 'pdf') {

                    if (!$this->hasFile("new_media.$index.file")) {
                        $validator->errors()->add(
                            "new_media.$index.file",
                            'Este medio requiere un archivo.'
                        );
                    }
                }

                if ($type === 'video' && empty($media['url'])) {

                    $validator->errors()->add(
                        "new_media.$index.url",
                        'El video requiere una URL.'
                    );
                }

                if (
                    ($media['is_featured'] ?? false) &&
                    $type !== 'image'
                ) {
                    $validator->errors()->add(
                        "new_media.$index.is_featured",
                        'Solo una imagen puede ser marcada como principal.'
                    );
                }

                if (
                    ($media['is_featured'] ?? false) &&
                    $type === 'image'
                ) {
                    $featuredCount++;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Debe quedar exactamente una imagen principal
            |--------------------------------------------------------------------------
            */

            if ($featuredCount !== 1) {
                $validator->errors()->add(
                    'media',
                    'La noticia debe tener exactamente una imagen principal.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Estado y fecha
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

            'existing_media.*.file.file' => 'El archivo enviado no es válido.',
            'existing_media.*.file.mimes' => 'El archivo debe ser una imagen o un PDF.',
            'existing_media.*.file.max' => 'El archivo no puede superar los 10 MB.',

            'new_media.*.type.required' => 'Cada medio nuevo debe tener un tipo.',
            'new_media.*.type.in' => 'El tipo de medio no es válido.',

            'new_media.*.file.file' => 'El archivo enviado no es válido.',
            'new_media.*.file.mimes' => 'El archivo debe ser una imagen o un PDF.',
            'new_media.*.file.max' => 'El archivo no puede superar los 10 MB.',

            'new_media.*.url.url' => 'La URL del video no es válida.',
        ];
    }
}