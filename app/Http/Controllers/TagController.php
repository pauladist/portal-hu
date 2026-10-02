<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * Crear un tag rápidamente desde el formulario de noticia.
     */
    public function quickStore(StoreTagRequest $request)
    {
        $slug = $this->generateUniqueSlug($request->title);

        $tag = Tag::create([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return response()->json($tag);
    }

    /**
     * Editar un tag rápidamente desde el formulario de noticia.
     */
    public function quickUpdate(
        UpdateTagRequest $request,
        Tag $tag
    ) {
        $slug = $this->generateUniqueSlug(
            $request->title,
            $tag->id
        );

        $tag->update([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return response()->json(
            $tag->fresh()
        );
    }

    /**
     * Eliminar un tag desde el formulario de noticia.
     */
    public function quickDestroy(Tag $tag)
    {
        // El tag se elimina también de las noticias
        // que lo tengan asociado.
        $tag->news()->detach();

        $tag->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Generar un slug único.
     */
    private function generateUniqueSlug(
        string $title,
        ?int $ignoreId = null
    ): string {
        $slug = Str::slug($title);

        $originalSlug = $slug;
        $count = 1;

        while (
            Tag::where('slug', $slug)
                ->when(
                    $ignoreId,
                    fn ($query) => $query->where(
                        'id',
                        '!=',
                        $ignoreId
                    )
                )
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}