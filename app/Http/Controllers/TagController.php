<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::withCount('news')
            ->orderBy('title')
            ->get();

        return Inertia::render('Communication/Tags/Index', [
            'tags' => $tags,
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/Tags/Create');
    }

    public function store(StoreTagRequest $request)
    {
        $slug = $this->generateUniqueSlug($request->title);

        Tag::create([
            'title' => $request->title,
            'slug' => $slug,
        ]);

        return redirect()
            ->route('communication.tags.index')
            ->with('success', 'Etiqueta creada correctamente.');
    }

    public function edit(Tag $tag)
    {
        return Inertia::render('Communication/Tags/Edit', [
            'tag' => $tag,
        ]);
    }

    public function update(
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

        return redirect()
            ->route('communication.tags.index')
            ->with('success', 'Etiqueta actualizada correctamente.');
    }

    public function destroy(Tag $tag)
    {
        $tag->news()->detach();

        $tag->delete();

        return redirect()
            ->route('communication.tags.index')
            ->with('success', 'Etiqueta eliminada correctamente.');
    }

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