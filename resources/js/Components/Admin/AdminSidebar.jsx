import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminSidebar({ onNavigate }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const roleName =
        user?.role?.name ||
        user?.role ||
        '';

    const isAdmin = roleName === 'Administrador';
    const isCommunication = roleName === 'Comunicación';

    const currentPath = window.location.pathname;

    const isActive = (path) => {
        return currentPath.startsWith(path);
    };

    return (
        <nav className="panel-sidebar-nav">

            {/* =====================================
                NOTICIAS
                ADMINISTRADOR + COMUNICACIÓN
                ===================================== */}

            {(isAdmin || isCommunication) && (
                <Link
                    href="/news"
                    onClick={onNavigate}
                    className={`panel-sidebar-item ${
                        isActive('/news')
                            ? 'is-active'
                            : ''
                    }`}
                >
                    <NewsIcon />

                    <span>
                        Noticias
                    </span>
                </Link>
            )}


            {/* =====================================
                BOTONERA
                SOLO ADMINISTRADOR
                ===================================== */}

            {isAdmin && (
                <Link
                    href="/admin/botonera"
                    onClick={onNavigate}
                    className={`panel-sidebar-item ${
                        isActive('/admin/botonera')
                            ? 'is-active'
                            : ''
                    }`}
                >
                    <MenuIcon />

                    <span>
                        Botonera
                    </span>
                </Link>
            )}


            {/* =====================================
                USUARIOS
                SOLO ADMINISTRADOR
                ===================================== */}

            {isAdmin && (
                <Link
                    href="/admin/users"
                    onClick={onNavigate}
                    className={`panel-sidebar-item ${
                        isActive('/admin/users')
                            ? 'is-active'
                            : ''
                    }`}
                >
                    <UsersIcon />

                    <span>
                        Usuarios
                    </span>
                </Link>
            )}

        </nav>
    );
}


/* =====================================================
   ICONO - NOTICIAS
   ===================================================== */

function NewsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M8 8H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M8 11.5H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M8 15H13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}


/* =====================================================
   ICONO - BOTONERA
   ===================================================== */

function MenuIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <rect
                x="14"
                y="4"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <rect
                x="4"
                y="14"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <rect
                x="14"
                y="14"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}


/* =====================================================
   ICONO - USUARIOS
   ===================================================== */

function UsersIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle
                cx="9"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M3.5 19C3.5 15.96 5.96 13.5 9 13.5C12.04 13.5 14.5 15.96 14.5 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M15 5.5C16.93 5.5 18.5 7.07 18.5 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M16 14C18.58 14.42 20.5 16.46 20.5 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}