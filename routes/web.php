<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\InstitutionalPageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])
    ->middleware('logout.public')
    ->name('home');

Route::get('/noticias/{news:slug}', [NewsController::class, 'show'])
    ->name('news.show');


/*
|--------------------------------------------------------------------------
| Páginas institucionales públicas
|--------------------------------------------------------------------------
*/

Route::get('/paginas/{institutionalPage:slug}', [
    InstitutionalPageController::class,
    'publicShow'
])->name('institutional-pages.show');


/*
|--------------------------------------------------------------------------
| Autenticación
|--------------------------------------------------------------------------
*/

Route::get('/login', [LoginController::class, 'create'])
    ->name('login');

Route::post('/login', [LoginController::class, 'store']);

Route::post('/logout', [LoginController::class, 'destroy'])
    ->middleware('auth');


/*
|--------------------------------------------------------------------------
| Administración
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'role:Administrador',
    'no.cache.auth'
])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Botonera
        |--------------------------------------------------------------------------
        */

        Route::get('/botonera', [MenuItemController::class, 'index'])
            ->name('botonera');

        Route::patch(
            '/menu-items/reorder',
            [MenuItemController::class, 'reorder']
        )->name('menu-items.reorder');

        Route::patch(
            '/menu-items/{menuItem}/status',
            [MenuItemController::class, 'toggleStatus']
        )->name('menu-items.status');

        Route::patch(
            '/menu-items/{menuItem}/quick-link',
            [MenuItemController::class, 'toggleQuickLink']
        )->name('menu-items.quick-link');

        /*
        |--------------------------------------------------------------------------
        | Usuarios
        |--------------------------------------------------------------------------
        */

        Route::resource('users', UserController::class)
            ->except(['show']);

        /*
        |--------------------------------------------------------------------------
        | Menu items
        |--------------------------------------------------------------------------
        */

        Route::resource('menu-items', MenuItemController::class)
            ->except(['show']);
    });


/*
|--------------------------------------------------------------------------
| Noticias
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'role:Administrador,Comunicación',
    'no.cache.auth'
])
    ->prefix('news')
    ->name('news.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/', [NewsController::class, 'index'])
            ->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Crear noticia
        |--------------------------------------------------------------------------
        */

        Route::get('/create', [NewsController::class, 'create'])
            ->name('create');

        /*
        |--------------------------------------------------------------------------
        | Guardar noticia
        |--------------------------------------------------------------------------
        */

        Route::post('/', [NewsController::class, 'store'])
            ->name('store');

        /*
        |--------------------------------------------------------------------------
        | Categorías
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/categories/quick-store',
            [CategoryController::class, 'quickStore']
        )->name('categories.quickStore');

        Route::put(
            '/categories/{category}/quick-update',
            [CategoryController::class, 'quickUpdate']
        )->name('categories.quickUpdate');

        Route::delete(
            '/categories/{category}/quick-destroy',
            [CategoryController::class, 'quickDestroy']
        )->name('categories.quickDestroy');

        /*
        |--------------------------------------------------------------------------
        | Tags
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/tags/quick-store',
            [TagController::class, 'quickStore']
        )->name('tags.quickStore');

        Route::put(
            '/tags/{tag}/quick-update',
            [TagController::class, 'quickUpdate']
        )->name('tags.quickUpdate');

        Route::delete(
            '/tags/{tag}/quick-destroy',
            [TagController::class, 'quickDestroy']
        )->name('tags.quickDestroy');

        /*
        |--------------------------------------------------------------------------
        | Editar noticia
        |--------------------------------------------------------------------------
        */

        Route::get('/{news}/edit', [NewsController::class, 'edit'])
            ->name('edit');

        /*
        |--------------------------------------------------------------------------
        | Actualizar noticia
        |--------------------------------------------------------------------------
        */

        Route::put('/{news}', [NewsController::class, 'update'])
            ->name('update');

        /*
        |--------------------------------------------------------------------------
        | Eliminar noticia
        |--------------------------------------------------------------------------
        */

        Route::delete('/{news}', [NewsController::class, 'destroy'])
            ->name('destroy');
    });


/*
|--------------------------------------------------------------------------
| Contenido institucional
|--------------------------------------------------------------------------
|
| Igual que las noticias:
| Administrador y Comunicación utilizan las mismas rutas.
|
*/

Route::middleware([
    'auth',
    'role:Administrador,Comunicación',
    'no.cache.auth'
])
    ->prefix('institutional-pages')
    ->name('institutional-pages.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Listado
        |--------------------------------------------------------------------------
        */

        Route::get('/', [
            InstitutionalPageController::class,
            'index'
        ])->name('index');

        /*
        |--------------------------------------------------------------------------
        | Crear
        |--------------------------------------------------------------------------
        */

        Route::get('/create', [
            InstitutionalPageController::class,
            'create'
        ])->name('create');

        /*
        |--------------------------------------------------------------------------
        | Guardar
        |--------------------------------------------------------------------------
        */

        Route::post('/', [
            InstitutionalPageController::class,
            'store'
        ])->name('store');

        /*
        |--------------------------------------------------------------------------
        | Editar
        |--------------------------------------------------------------------------
        */

        Route::get('/{institutionalPage}/edit', [
            InstitutionalPageController::class,
            'edit'
        ])->name('edit');

        /*
        |--------------------------------------------------------------------------
        | Actualizar
        |--------------------------------------------------------------------------
        */

        Route::put('/{institutionalPage}', [
            InstitutionalPageController::class,
            'update'
        ])->name('update');

        /*
        |--------------------------------------------------------------------------
        | Eliminar
        |--------------------------------------------------------------------------
        */

        Route::delete('/{institutionalPage}', [
            InstitutionalPageController::class,
            'destroy'
        ])->name('destroy');

        /*
        |--------------------------------------------------------------------------
        | Publicar
        |--------------------------------------------------------------------------
        */

        Route::patch('/{institutionalPage}/publish', [
            InstitutionalPageController::class,
            'publish'
        ])->name('publish');

        /*
        |--------------------------------------------------------------------------
        | Pasar a borrador
        |--------------------------------------------------------------------------
        */

        Route::patch('/{institutionalPage}/unpublish', [
            InstitutionalPageController::class,
            'unpublish'
        ])->name('unpublish');
    });