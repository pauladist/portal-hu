<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('news')
            ->orderBy('title')
            ->get();

        return Inertia::render('Communication/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/Categories/Create');
    }

    public function store(StoreCategoryRequest $request)
    {
        $slug = $this->generateUniqueSlug($request->title);

        Category::create([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return redirect()
            ->route('communication.categories.index')
            ->with('success', 'Categoría creada correctamente.');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Communication/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(
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

        return redirect()
            ->route('communication.categories.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(Category $category)
    {
        $category->news()->detach();

        $category->delete();

        return redirect()
            ->route('communication.categories.index')
            ->with('success', 'Categoría eliminada correctamente.');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
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
                    fn ($query) => $query->where('id', '!=', $ignoreId)
                )
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}