<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ], [
            'email.required' => 'Ingresá tu correo electrónico.',
            'email.email' => 'Ingresá un correo electrónico válido.',
            'password.required' => 'Ingresá tu contraseña.',
        ]);

        if (!Auth::attempt($credentials)) {
            return back()->withErrors([
                'email' => 'Las credenciales ingresadas no son correctas.',
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if (
            $user->role->name === 'Administrador' ||
            $user->role->name === 'Comunicación'
        ) {
            return redirect()->intended('/news');
        }

        Auth::logout();

        return back()->withErrors([
            'email' => 'El usuario no tiene un rol autorizado.',
        ]);
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}