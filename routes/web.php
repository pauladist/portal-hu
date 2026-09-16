<?php

use App\Http\Controllers\Auth\LoginController;
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

Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth');

Route::middleware(['auth', 'role:Administrador'])->prefix('admin')->name('admin.')->group(function () {

    Route::resource('users', UserController::class)
        ->except(['show']);
});

/*
|--------------------------------------------------------------------------
| Rutas de Administración
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:Administrador'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('Admin/Dashboard');
    });
});


/*
|--------------------------------------------------------------------------
| Rutas de Comunicación
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:Administrador,Comunicación'])->group(function () {
    Route::get('/comunicacion', function () {
        return Inertia::render('Communication/Dashboard');
    });
});