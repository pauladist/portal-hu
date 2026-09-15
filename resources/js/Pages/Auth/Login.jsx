import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post('/login');
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div>
                <h1>Iniciar sesión</h1>

                <form onSubmit={submit}>
                    <div>
                        <label>Email</label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        {errors.email && (
                            <div>{errors.email}</div>
                        )}
                    </div>

                    <div>
                        <label>Contraseña</label>

                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        {errors.password && (
                            <div>{errors.password}</div>
                        )}
                    </div>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </>
    );
}