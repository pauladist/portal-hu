import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import './css/login.css';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <main className="ph-login-page">
                <section className="ph-login-card">

                    {/* Imagen del Hospital */}
                    <div className="ph-login-hero">
                        <img
                            src="/images/hospital.jpg"
                            alt="Hospital Universitario"
                        />

                        <div className="ph-login-overlay"></div>

                        {/* Logo */}
                        <div className="ph-login-brand">
                            <img
                                src="/images/logo-hu-blanco.png"
                                alt="Hospital Universitario"
                            />
                        </div>
                    </div>

                    {/* Onda blanca */}
                    <svg
                        className="ph-login-wave"
                        viewBox="0 0 1000 600"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            d="
                                M0,165
                                C140,95 320,125 500,245
                                C680,365 800,445 1000,400
                                L1000,600
                                L0,600
                                Z
                            "
                        />
                    </svg>

                    {/* Formulario */}
                    <div className="ph-login-form-wrap">

                        <div className="ph-login-heading">
                            <span className="ph-login-label">
                                PORTAL HU
                            </span>

                            <h1 className="ph-login-title">
                                Iniciar sesión
                            </h1>

                            <p className="ph-login-description">
                                Ingresá con las credenciales proporcionadas
                                por el administrador.
                            </p>
                        </div>

                        <form
                            className="ph-login-form"
                            onSubmit={submit}
                        >

                            {/* Email */}
                            <div className="ph-field">

                                <label
                                    className="ph-field-label"
                                    htmlFor="email"
                                >
                                    Correo electrónico
                                </label>

                                <div className="ph-field-control">

                                    <span className="ph-field-icon material-symbols-outlined">
                                        person
                                    </span>

                                    <input
                                        id="email"
                                        type="email"
                                        className="ph-field-input"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        placeholder="correo@hospital.uncu.edu.ar"
                                        autoComplete="email"
                                        autoFocus
                                    />

                                </div>

                                {errors.email && (
                                    <p className="ph-field-error">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* Contraseña */}
                            <div className="ph-field">

                                <label
                                    className="ph-field-label"
                                    htmlFor="password"
                                >
                                    Contraseña
                                </label>

                                <div className="ph-field-control">

                                    <span className="ph-field-icon material-symbols-outlined">
                                        lock
                                    </span>

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        className="ph-field-input"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ingresá tu contraseña"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="ph-field-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Ocultar contraseña'
                                                : 'Mostrar contraseña'
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword
                                                ? 'visibility_off'
                                                : 'visibility'}
                                        </span>
                                    </button>

                                </div>

                                {errors.password && (
                                    <p className="ph-field-error">
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Error general */}
                            {errors.error && (
                                <div className="ph-login-error">
                                    {errors.error}
                                </div>
                            )}

                            {/* Botón */}
                            <button
                                type="submit"
                                className="ph-login-submit"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Ingresando...'
                                    : 'Iniciar sesión'}
                            </button>

                        </form>

                        {/* Información */}
                        <div className="ph-login-info">

                            <span className="material-symbols-outlined">
                                info
                            </span>

                            <p>
                                El acceso al Portal HU está restringido
                                a usuarios autorizados.
                            </p>

                        </div>

                    </div>

                </section>
            </main>
        </>
    );
}