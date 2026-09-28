import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";

import AdminSidebar from "../Components/Admin/AdminSidebar";

import "./PanelLayout.css";

export default function PanelLayout({ children, title = "Portal HU" }) {
    const { auth } = usePage().props;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const user = auth?.user;

    const roleName = user?.role?.name || user?.role || "Usuario";

    const initials =
        roleName === "Administrador"
            ? "AD"
            : roleName === "Comunicación"
              ? "CO"
              : roleName.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        router.post("/logout");
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <>
            <Head title={title} />

            <div className="panel-layout">
                {/* =========================================
                    SIDEBAR
                    ========================================= */}

                <aside
                    className={`panel-sidebar ${sidebarOpen ? "is-open" : ""}`}
                >
                    {/* Imagen institucional inferior */}
                    <div className="panel-sidebar-background" />

                    {/* Contenido */}
                    <div className="panel-sidebar-content">
                        {/* Logo */}
                        <div className="panel-sidebar-logo">
                            <img
                                src="/images/logo-hu-blanco.png"
                                alt="Hospital Universitario UNCUYO"
                            />
                        </div>

                        {/* Navegación */}
                        <AdminSidebar onNavigate={closeSidebar} />
                    </div>
                </aside>

                {/* =========================================
                    OVERLAY MOBILE
                    ========================================= */}

                {sidebarOpen && (
                    <button
                        type="button"
                        className="panel-sidebar-overlay"
                        aria-label="Cerrar menú"
                        onClick={closeSidebar}
                    />
                )}

                {/* =========================================
                    CONTENIDO PRINCIPAL
                    ========================================= */}

                <div className="panel-main">
                    {/* =====================================
                        TOPBAR
                        ===================================== */}

                    <header className="panel-topbar">
                        {/* Hamburguesa - solo mobile */}
                        <button
                            type="button"
                            className="panel-menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Abrir menú"
                            aria-expanded={sidebarOpen}
                        >
                            <span />
                            <span />
                            <span />
                        </button>

                        {/* Espacio izquierdo desktop */}
                        <div className="panel-topbar-spacer" />

                        {/* Usuario */}
                        <div className="panel-user-wrapper">
                            <button
                                type="button"
                                className={`panel-user-button ${
                                    userMenuOpen ? "is-open" : ""
                                }`}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                aria-expanded={userMenuOpen}
                            >
                                <span className="panel-user-avatar">
                                    {initials}
                                </span>

                                <span className="panel-user-role">
                                    {roleName}
                                </span>

                                <span className="panel-user-arrow">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6 9L12 15L18 9"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </button>

                            {/* Dropdown */}
                            {userMenuOpen && (
                                <div className="panel-user-dropdown">
                                    <button
                                        type="button"
                                        className="panel-logout-button"
                                        onClick={handleLogout}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10 5H5C4.45 5 4 5.45 4 6V18C4 18.55 4.45 19 5 19H10"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                            />

                                            <path
                                                d="M14 8L18 12L14 16"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            <path
                                                d="M18 12H9"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* =====================================
                        CONTENIDO DE LA PÁGINA
                        ===================================== */}

                    <main className="panel-content">{children}</main>
                </div>
            </div>
        </>
    );
}
