<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Crear una categoría rápidamente desde el formulario de noticia.
     */
    public function quickStore(StoreCategoryRequest $request)
    {
        $slug = $this->generateUniqueSlug($request->title);

        $category = Category::create([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return response()->json($category);
    }

    /**
     * Editar una categoría rápidamente desde el formulario de noticia.
     */
    public function quickUpdate(
        UpdateCategoryRequest $request,
        Category $category
    ) {
        $slug = $this->generateUniqueSlug(
            $request->title,
            $category->id
        );

        $category->update([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return response()->json(
            $category->fresh()
        );
    }

    /**
     * Eliminar una categoría desde el formulario de noticia.
     */
    public function quickDestroy(Category $category)
    {
        // La categoría se elimina también de las noticias
        // que la tengan asociada.
        $category->news()->detach();

        $category->delete();

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
            Category::where('slug', $slug)
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