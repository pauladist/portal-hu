<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Models\Category;
use App\Models\News;
use App\Models\NewsMedia;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::query()
            ->with([
                'user:id,name,last_name',
                'media',
            ])
            ->orderByDesc('created_at');

        // Buscar por título
        $query->when($request->filled('search'), function ($query) use ($request) {
            $query->where('title', 'like', '%' . $request->search . '%');
        });

        // Filtrar por estado
        $query->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
            $query->where('status', $request->status);
        });

        // Filtrar por año
        $query->when($request->filled('year'), function ($query) use ($request) {
            $query->whereYear('created_at', $request->year);
        });

        // Filtrar por mes
        $query->when($request->filled('month'), function ($query) use ($request) {
            $query->whereMonth('created_at', $request->month);
        });

        $news = $query
            ->paginate(10)
            ->withQueryString();

        $counts = [
            'all' => News::count(),
            'published' => News::where('status', 'published')->count(),
            'scheduled' => News::where('status', 'scheduled')->count(),
            'draft' => News::where('status', 'draft')->count(),
        ];

        return Inertia::render('Communication/Dashboard', [
            'news' => $news,
            'counts' => $counts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
                'month' => $request->month,
                'year' => $request->year,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/News/Create', [
            'categories' => Category::withCount('news')
                ->orderByDesc('news_count')
                ->orderBy('title')
                ->get(),

            'tags' => Tag::withCount('news')
                ->orderByDesc('news_count')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function store(StoreNewsRequest $request)
    {
        DB::transaction(function () use ($request) {

            $slug = $this->generateUniqueSlug($request->title);

            $publishedAt = $request->published_at;

            if ($request->status === 'draft') {
                $publishedAt = null;
            }

            if ($request->status === 'published' && !$publishedAt) {
                $publishedAt = now();
            }

            /*
            |--------------------------------------------------------------------------
            | Crear noticia
            |--------------------------------------------------------------------------
            */

            $news = News::create([
                'user_id' => auth()->id(),
                'title' => $request->title,
                'slug' => $slug,
                'subtitle' => $request->subtitle,
                'content' => $request->content,
                'views' => 0,
                'published_at' => $publishedAt,
                'status' => $request->status,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Categorías y tags
            |--------------------------------------------------------------------------
            */

            $news->categories()->sync(
                $request->categories ?? []
            );

            $news->tags()->sync(
                $request->tags ?? []
            );

            /*
            |--------------------------------------------------------------------------
            | Imagen principal / portada
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('cover')) {

                $coverPath = $request
                    ->file('cover')
                    ->store('news', 'public');

                $news->media()->create([
                    'type' => 'image',
                    'path' => $coverPath,
                    'title' => $request->title,
                    'is_featured' => true,
                    'order' => 0,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Archivos insertados dentro del editor
            |--------------------------------------------------------------------------
            */

            $content = $this->processEditorMedia(
                $news,
                $request->content,
                $request->input('editor_media', []),
                $request->file('editor_media', [])
            );

            /*
            |--------------------------------------------------------------------------
            | Guardar HTML definitivo
            |--------------------------------------------------------------------------
            */

            $news->update([
                'content' => $content,
            ]);
        });

        return redirect()
            ->route('news.dashboard')
            ->with('success', 'Noticia creada correctamente.');
    }

    public function show(News $news)
    {
        abort_unless($news->status === 'published', 404);

        $news->load([
            'categories',
            'tags',
            'media',
        ]);

        $news->increment('views');

        return Inertia::render('News/Show', [
            'news' => $news,
        ]);
    }

    public function edit(News $news)
    {
        return Inertia::render('Communication/News/Edit', [
            'news' => $news->load([
                'categories:id',
                'tags:id',
                'media',
            ]),

            'publishedAtInput' => $news->status === 'scheduled' && $news->published_at
                ? $news->published_at->format('Y-m-d\\TH:i')
                : '',

            'categories' => Category::withCount('news')
                ->orderByDesc('news_count')
                ->orderBy('title')
                ->get(),

            'tags' => Tag::withCount('news')
                ->orderByDesc('news_count')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function update(UpdateNewsRequest $request, News $news)
    {
        DB::transaction(function () use ($request, $news) {

            $slug = $this->generateUniqueSlug(
                $request->title,
                $news->id
            );

            $publishedAt = $request->published_at;

            if ($request->status === 'draft') {
                $publishedAt = null;
            }

            // Si ya estaba publicada, conservar su fecha original
            if ($request->status === 'published' && !$publishedAt) {
                $publishedAt = $news->status === 'published'
                    ? $news->published_at
                    : now();
            }

            /*
            |--------------------------------------------------------------------------
            | Portada nueva (opcional)
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('cover')) {

                $oldCovers = $news->media()
                    ->where('type', 'image')
                    ->where('is_featured', true)
                    ->get();

                foreach ($oldCovers as $oldCover) {
                    $this->deleteMediaFile($oldCover);
                    $oldCover->delete();
                }

                $news->media()->create([
                    'type' => 'image',
                    'path' => $request->file('cover')->store('news', 'public'),
                    'title' => $request->title,
                    'is_featured' => true,
                    'order' => 0,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Archivos nuevos insertados en el editor
            |--------------------------------------------------------------------------
            */

            $content = $this->processEditorMedia(
                $news,
                $request->content,
                $request->input('editor_media', []),
                $request->file('editor_media', [])
            );

            /*
            |--------------------------------------------------------------------------
            | Actualizar noticia
            |--------------------------------------------------------------------------
            */

            $news->update([
                'title' => $request->title,
                'slug' => $slug,
                'subtitle' => $request->subtitle,
                'content' => $content,
                'published_at' => $publishedAt,
                'status' => $request->status,
            ]);

            $news->categories()->sync($request->categories ?? []);
            $news->tags()->sync($request->tags ?? []);

            /*
            |--------------------------------------------------------------------------
            | Limpiar archivos del editor que ya no se usan en el contenido
            |--------------------------------------------------------------------------
            */

            $this->removeUnusedEditorMedia($news->fresh('media'));
        });

        return redirect()
            ->route('news.dashboard')
            ->with('success', 'Noticia actualizada correctamente.');
    }

    public function destroy(News $news)
    {
        DB::transaction(function () use ($news) {

            foreach ($news->media as $media) {
                $this->deleteMediaFile($media);
            }

            $news->delete();
        });

        return redirect()
            ->route('news.dashboard')
            ->with('success', 'Noticia eliminada correctamente.');
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
            News::where('slug', $slug)
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

    /**
     * Guarda los archivos (imágenes / PDF) insertados en el editor y
     * reemplaza en el HTML la URL temporal (blob:) por la URL pública.
     * Los archivos que el usuario sacó del editor antes de enviar se ignoran.
     */
    private function processEditorMedia(
        News $news,
        string $content,
        array $mediaInputs,
        array $mediaFiles
    ): string {

        foreach ($mediaInputs as $index => $mediaData) {

            $file = $mediaFiles[$index]['file'] ?? null;
            $blobUrl = $mediaData['url'] ?? null;

            if (!$file || !$blobUrl) {
                continue;
            }

            // El archivo ya no está en el contenido: no lo guardamos
            if (!str_contains($content, $blobUrl)) {
                continue;
            }

            $type = str_starts_with($file->getMimeType(), 'image/')
                ? 'image'
                : 'pdf';

            $path = $file->store('news', 'public');

            $news->media()->create([
                'type' => $type,
                'path' => $path,
                'title' => $file->getClientOriginalName(),
                'is_featured' => false,
                'order' => $news->media()->count(),
            ]);

            $content = str_replace(
                $blobUrl,
                Storage::disk('public')->url($path),
                $content
            );
        }

        return $content;
    }

    /**
     * Borra archivos no destacados cuyo path ya no aparece en el contenido.
     */
    private function removeUnusedEditorMedia(News $news): void
    {
        foreach ($news->media as $media) {

            if ($media->is_featured || !in_array($media->type, ['image', 'pdf'])) {
                continue;
            }

            if (!str_contains($news->content, $media->path)) {
                $this->deleteMediaFile($media);
                $media->delete();
            }
        }
    }

    private function deleteMediaFile(NewsMedia $media): void
    {
        if (
            in_array($media->type, ['image', 'pdf']) &&
            $media->path
        ) {
            Storage::disk('public')->delete($media->path);
        }
    }
}