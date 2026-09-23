import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Portal HU" />

            <div>
                <h1>Portal Hospital Universitario</h1>
                <p>Bienvenido/a.</p>

                <Link href="/login">Iniciar sesión</Link>
            </div>
        </>
    );
}