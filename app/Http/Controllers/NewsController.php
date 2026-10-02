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

            $content = $request->content;

            foreach ($request->editor_media ?? [] as $mediaData) {

                $mediaId = $mediaData['id'];

                $file = $mediaData['file'];

                $mimeType = $file->getMimeType();

                /*
                | Guardar archivo
                */

                $path = $file->store('news', 'public');

                /*
                | Determinar tipo
                */

                if (str_starts_with($mimeType, 'image/')) {
                    $type = 'image';
                } else {
                    $type = 'pdf';
                }

                /*
                | Crear registro de media
                */

                $media = $news->media()->create([
                    'type' => $type,
                    'path' => $path,
                    'title' => $mediaData['file']->getClientOriginalName(),
                    'is_featured' => false,
                    'order' => $news->media()->count(),
                ]);

                /*
                |--------------------------------------------------------------------------
                | URL pública definitiva
                |--------------------------------------------------------------------------
                */

                $publicUrl = Storage::disk('public')->url($path);

                /*
                |--------------------------------------------------------------------------
                | Reemplazar blob URL del editor
                |--------------------------------------------------------------------------
                |
                | El RichTextEditor guarda temporalmente:
                |
                | blob:http://localhost/...
                |
                | junto con:
                |
                | mediaId="..."
                |
                */

                $content = str_replace(
                    $mediaId,
                    (string) $media->id,
                    $content
                );

                /*
                | Imagen
                */

                if ($type === 'image') {

                    /*
                    | Reemplazamos el src blob por la URL definitiva.
                    */

                    $content = preg_replace(
                        '/(<img[^>]*mediaId="' .
                        preg_quote($mediaId, '/') .
                        '"[^>]*src=")[^"]*(")/',
                        '$1' . $publicUrl . '$2',
                        $content
                    );

                    /*
                    | También puede aparecer media-id con otra variante.
                    */

                    $content = preg_replace(
                        '/(<img[^>]*src=")[^"]*(".*?data-news-image)/',
                        '$1' . $publicUrl . '$2',
                        $content
                    );
                }

                /*
                | PDF / archivo
                */

                if ($type === 'pdf') {

                    $content = preg_replace(
                        '/(<div[^>]*data-pdf-file[^>]*>.*?<a[^>]*href=")[^"]*(")/s',
                        '$1' . $publicUrl . '$2',
                        $content
                    );
                }
            }

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
                'categories',
                'tags',
                'media',
            ]),
            'categories' => Category::orderBy('title')->get(),
            'tags' => Tag::orderBy('title')->get(),
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

            if ($request->status === 'published' && !$publishedAt) {
                $publishedAt = now();
            }

            /*
            |--------------------------------------------------------------------------
            | Actualizar noticia
            |--------------------------------------------------------------------------
            */

            $news->update([
                'title' => $request->title,
                'slug' => $slug,
                'subtitle' => $request->subtitle,
                'content' => $request->content,
                'published_at' => $publishedAt,
                'status' => $request->status,
            ]);

            $news->categories()->sync($request->categories ?? []);
            $news->tags()->sync($request->tags ?? []);

            /*
            |--------------------------------------------------------------------------
            | Eliminar medios
            |--------------------------------------------------------------------------
            */

            foreach ($request->deleted_media ?? [] as $mediaId) {

                $media = $news->media()
                    ->where('id', $mediaId)
                    ->first();

                if (!$media) {
                    continue;
                }

                $this->deleteMediaFile($media);

                $media->delete();
            }

            /*
            |--------------------------------------------------------------------------
            | Actualizar medios existentes
            |--------------------------------------------------------------------------
            */

            foreach ($request->existing_media ?? [] as $mediaData) {

                $media = $news->media()
                    ->where('id', $mediaData['id'])
                    ->first();

                if (!$media) {
                    continue;
                }

                /*
                | Reemplazar archivo
                */

                if (isset($mediaData['file'])) {

                    $this->deleteMediaFile($media);

                    $media->path = $mediaData['file']
                        ->store('news', 'public');
                }

                /*
                | Actualizar datos
                */

                $media->title = $mediaData['title'] ?? null;
                $media->order = $mediaData['order'] ?? 0;

                /*
                | Cambiar imagen principal
                */

                $isFeatured = filter_var(
                    $mediaData['is_featured'] ?? false,
                    FILTER_VALIDATE_BOOLEAN
                );

                if ($isFeatured && $media->type === 'image') {

                    $news->media()
                        ->where('id', '!=', $media->id)
                        ->update([
                            'is_featured' => false,
                        ]);
                }

                $media->is_featured = $isFeatured;

                $media->save();
            }

            /*
            |--------------------------------------------------------------------------
            | Crear medios nuevos
            |--------------------------------------------------------------------------
            */

            foreach ($request->new_media ?? [] as $mediaData) {

                $this->createMedia($news, $mediaData);
            }
        });

        return redirect()
            ->route('news.index')
            ->with('success', 'Noticia actualizada correctamente.');
    }

    public function destroy(News $news)
    {
        foreach ($news->media as $media) {
            $this->deleteMediaFile($media);
        }

        $news->delete();

        return redirect()
            ->route('news.index')
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

    private function createMedia(
        News $news,
        array $mediaData
    ): NewsMedia {

        $path = null;

        /*
        | Imagen o PDF
        */

        if (
            in_array($mediaData['type'], ['image', 'pdf']) &&
            isset($mediaData['file'])
        ) {
            $path = $mediaData['file']->store('news', 'public');
        }

        /*
        | Video externo
        */

        if ($mediaData['type'] === 'video') {
            $path = $mediaData['url'];
        }

        /*
        | Si este medio es la nueva principal,
        | quitar principal a cualquier otra.
        */

        $isFeatured = filter_var(
            $mediaData['is_featured'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if ($isFeatured && $mediaData['type'] === 'image') {

            $news->media()->update([
                'is_featured' => false,
            ]);
        }

        return $news->media()->create([
            'type' => $mediaData['type'],
            'path' => $path,
            'title' => $mediaData['title'] ?? null,
            'is_featured' => $isFeatured,
            'order' => $mediaData['order'] ?? 0,
        ]);
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