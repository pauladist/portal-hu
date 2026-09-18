<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
});

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

Route::middleware(['auth', 'role:Administrador'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        });

        Route::resource('users', UserController::class)
            ->except(['show']);
    });


/*
|--------------------------------------------------------------------------
| Comunicación
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:Administrador,Comunicación'])
    ->prefix('comunicacion')
    ->name('communication.')
    ->group(function () {

        Route::get('/', function () {
            return Inertia::render('Communication/Dashboard');
        });

        Route::resource('news', NewsController::class)
            ->except(['show']);
    });