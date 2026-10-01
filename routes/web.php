<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\MenuItemController;
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

        Route::resource('users', UserController::class)
            ->except(['show']);

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

        // Dashboard principal
        Route::get('/', [NewsController::class, 'index'])
            ->name('dashboard');

        // Crear noticia
        Route::get('/create', [NewsController::class, 'create'])
            ->name('create');

        // Guardar noticia
        Route::post('/', [NewsController::class, 'store'])
            ->name('store');

        // Editar noticia
        Route::get('/{news}/edit', [NewsController::class, 'edit'])
            ->name('edit');

        // Actualizar noticia
        Route::put('/{news}', [NewsController::class, 'update'])
            ->name('update');

        // Eliminar noticia
        Route::delete('/{news}', [NewsController::class, 'destroy'])
            ->name('destroy');

        // Categorías
        Route::resource('categories', CategoryController::class)
            ->except(['show']);

        // Tags
        Route::resource('tags', TagController::class)
            ->except(['show']);
    });
