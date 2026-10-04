<?php

namespace App\Http\Controllers;

use App\Models\InstitutionalPage;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionalPageController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LISTADO
    |--------------------------------------------------------------------------
    */

    public function index(): Response
    {
        $pages = InstitutionalPage::query()
            ->with([
                'user',
                'media',
            ])
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render(
            'Communication/InstitutionalPages/Index',
            [
                'pages' => $pages,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CREAR
    |--------------------------------------------------------------------------
    */

    public function create(): Response
    {
        return Inertia::render(
            'Communication/InstitutionalPages/Create'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GUARDAR
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): RedirectResponse {

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'status' => [
                'required',
                'in:draft,published',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        |
        | El usuario no tiene que escribirlo.
        | Se genera automáticamente a partir del título.
        |
        */

        $slug = $this->generateUniqueSlug(
            $validated['title']
        );


        /*
        |--------------------------------------------------------------------------
        | FECHA DE PUBLICACIÓN
        |--------------------------------------------------------------------------
        */

        $publishedAt = null;

        if ($validated['status'] === 'published') {
            $publishedAt = $validated['published_at']
                ?? now();
        }


        /*
        |--------------------------------------------------------------------------
        | CREAR PÁGINA
        |--------------------------------------------------------------------------
        */

        InstitutionalPage::create([
            'user_id' => Auth::id(),

            'title' => $validated['title'],

            'slug' => $slug,

            'subtitle' => null,

            'content' => $validated['content'] ?? null,

            'status' => $validated['status'],

            'published_at' => $publishedAt,
        ]);


        return redirect()
            ->route('institutional-pages.index')
            ->with(
                'success',
                'Página institucional creada correctamente.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | EDITAR
    |--------------------------------------------------------------------------
    */

    public function edit(
        InstitutionalPage $institutionalPage
    ): Response {

        $institutionalPage->load([
            'media',
        ]);

        return Inertia::render(
            'Communication/InstitutionalPages/Edit',
            [
                'page' => $institutionalPage,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        InstitutionalPage $institutionalPage
    ): RedirectResponse {

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'status' => [
                'required',
                'in:draft,published',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        |
        | Si cambia el título, actualizamos el slug.
        | El botón de la botonera no se rompe porque guarda page_id.
        |
        */

        $slug = $this->generateUniqueSlug(
            $validated['title'],
            $institutionalPage->id
        );


        /*
        |--------------------------------------------------------------------------
        | FECHA DE PUBLICACIÓN
        |--------------------------------------------------------------------------
        */

        $publishedAt = null;

        if ($validated['status'] === 'published') {

            $publishedAt =
                $institutionalPage->published_at
                ?? $validated['published_at']
                ?? now();
        }


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR
        |--------------------------------------------------------------------------
        */

        $institutionalPage->update([
            'title' => $validated['title'],

            'slug' => $slug,

            'content' => $validated['content'] ?? null,

            'status' => $validated['status'],

            'published_at' => $publishedAt,
        ]);


        return redirect()
            ->route('institutional-pages.index')
            ->with(
                'success',
                'Página institucional actualizada correctamente.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    public function destroy(
        InstitutionalPage $institutionalPage
    ): RedirectResponse {

        $institutionalPage->delete();

        return redirect()
            ->route('institutional-pages.index')
            ->with(
                'success',
                'Página institucional eliminada correctamente.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | VISTA PÚBLICA
    |--------------------------------------------------------------------------
    |
    | Esta NO es la previsualización del panel.
    |
    | La previsualización del panel es un modal manejado por React.
    |
    | Este método se utiliza cuando desde el portal se entra a una
    | página institucional completa.
    |
    */

    public function publicShow(
        InstitutionalPage $institutionalPage
    ): Response {

        abort_unless(
            $institutionalPage->status === 'published',
            404
        );


        $institutionalPage->load([
            'media',
        ]);


        return Inertia::render(
            'Communication/InstitutionalPages/Show',
            [
                'page' => $institutionalPage,
                'menuItems' => MenuItem::publicTree(),
                'quickLinks' => MenuItem::publicQuickLinks(),
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GENERAR SLUG ÚNICO
    |--------------------------------------------------------------------------
    */

    private function generateUniqueSlug(
        string $title,
        ?int $ignoreId = null
    ): string {

        $baseSlug = Str::slug($title);


        /*
        |----------------------------------------------------------------------
        | Si por algún motivo el título no genera slug
        |----------------------------------------------------------------------
        */

        if ($baseSlug === '') {
            $baseSlug = 'pagina-institucional';
        }


        $slug = $baseSlug;

        $counter = 1;


        while (
            InstitutionalPage::query()
                ->where('slug', $slug)
                ->when(
                    $ignoreId,
                    function ($query) use ($ignoreId) {
                        $query->where(
                            'id',
                            '!=',
                            $ignoreId
                        );
                    }
                )
                ->exists()
        ) {

            $slug = $baseSlug . '-' . $counter;

            $counter++;
        }


        return $slug;
    }
}