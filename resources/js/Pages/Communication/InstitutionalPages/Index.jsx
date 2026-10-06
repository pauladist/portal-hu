import React, { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";

import PanelLayout from "@/Layouts/PanelLayout";

import InstitutionalPagePreview from "./components/InstitutionalPagePreview";

import "./css/index.css";

export default function Index({ pages = [] }) {
    const [search, setSearch] = useState("");
    const [selectedPage, setSelectedPage] = useState(null);
    const [pageToDelete, setPageToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Filtrar páginas
    |--------------------------------------------------------------------------
    */

    const filteredPages = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return pages;
        }

        return pages.filter((page) => {
            return (
                page.title?.toLowerCase().includes(term) ||
                page.subtitle?.toLowerCase().includes(term)
            );
        });
    }, [pages, search]);

    /*
    |--------------------------------------------------------------------------
    | Abrir preview
    |--------------------------------------------------------------------------
    */

    const handleOpenPreview = (page) => {
        setSelectedPage(page);
    };

    /*
    |--------------------------------------------------------------------------
    | Cerrar preview
    |--------------------------------------------------------------------------
    */

    const handleClosePreview = () => {
        setSelectedPage(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Editar
    |--------------------------------------------------------------------------
    */

    const handleEdit = (page) => {
        setSelectedPage(null);

        router.visit(route("institutional-pages.edit", page.id));
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const handleDelete = (page) => {
        setPageToDelete(page);
    };

    const confirmDelete = () => {
        if (!pageToDelete) {
            return;
        }

        router.delete(route("institutional-pages.destroy", pageToDelete.id), {
            preserveScroll: true,

            onStart: () => setDeleting(true),

            onFinish: () => {
                setDeleting(false);
                setPageToDelete(null);
            },
        });
    };

    const cancelDelete = () => {
        if (!deleting) {
            setPageToDelete(null);
        }
    };

    // Cerrar el modal con la tecla Escape
    useEffect(() => {
        if (!pageToDelete) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !deleting) {
                setPageToDelete(null);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [pageToDelete, deleting]);

    /*
    |--------------------------------------------------------------------------
    | Nueva página
    |--------------------------------------------------------------------------
    */

    const handleCreate = () => {
        router.visit(route("institutional-pages.create"));
    };

    /*
    |--------------------------------------------------------------------------
    | Fecha
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "Sin modificaciones";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Sin modificaciones";
        }

        return parsedDate.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <PanelLayout>
            <Head title="Contenido institucional" />

            <div className="institutional-index">
                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header className="institutional-index__header">
                    <div className="institutional-index__heading">
                        <h1>Contenido institucional</h1>

                        <p>Administrá las páginas informativas del portal.</p>
                    </div>

                    <button
                        type="button"
                        className="institutional-index__new-button"
                        onClick={handleCreate}
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nueva página
                    </button>
                </header>

                {/* =====================================================
                    BUSCADOR
                ====================================================== */}

                <div className="institutional-index__toolbar">
                    <div className="institutional-search">
                        <span className="material-symbols-outlined">
                            search
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar páginas..."
                            aria-label="Buscar páginas institucionales"
                        />

                        {search && (
                            <button
                                type="button"
                                className="institutional-search__clear"
                                onClick={() => setSearch("")}
                                aria-label="Limpiar búsqueda"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    LISTADO
                ====================================================== */}

                <section className="institutional-pages-list">
                    {filteredPages.length === 0 ? (
                        <div className="institutional-empty">
                            <div className="institutional-empty__icon">
                                <span className="material-symbols-outlined">
                                    article
                                </span>
                            </div>

                            <h2>
                                {search
                                    ? "No encontramos páginas"
                                    : "No hay páginas institucionales"}
                            </h2>

                            <p>
                                {search
                                    ? "Probá con otro término de búsqueda."
                                    : "Creá la primera página institucional del portal."}
                            </p>

                            {!search && (
                                <button
                                    type="button"
                                    className="institutional-empty__button"
                                    onClick={handleCreate}
                                >
                                    Crear página
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredPages.map((page) => {
                            const isPublished = page.status === "published";

                            return (
                                <article
                                    key={page.id}
                                    className="institutional-page-card"
                                    onClick={() => handleOpenPreview(page)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {
                                            event.preventDefault();

                                            handleOpenPreview(page);
                                        }
                                    }}
                                >
                                    {/* =================================
                                        CONTENIDO
                                    ================================== */}

                                    <div className="institutional-page-card__content">
                                        <div className="institutional-page-card__top">
                                            <div className="institutional-page-card__main">
                                                <h2>{page.title}</h2>

                                                {page.subtitle && (
                                                    <p>{page.subtitle}</p>
                                                )}
                                            </div>

                                            <span
                                                className={`institutional-status ${
                                                    isPublished
                                                        ? "institutional-status--published"
                                                        : "institutional-status--draft"
                                                }`}
                                            >
                                                {isPublished
                                                    ? "Publicado"
                                                    : "Borrador"}
                                            </span>
                                        </div>

                                        <div className="institutional-page-card__meta">
                                            <span>
                                                <span className="material-symbols-outlined">
                                                    calendar_today
                                                </span>
                                                Última modificación:{" "}
                                                {formatDate(page.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* =================================
                                        ACCIONES
                                    ================================== */}

                                    <div
                                        className="institutional-page-card__actions"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onKeyDown={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="institutional-action-button"
                                            aria-label={`Editar ${page.title}`}
                                            title="Editar"
                                            onClick={() => handleEdit(page)}
                                        >
                                            <span className="material-symbols-outlined">
                                                edit
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className="institutional-action-button institutional-action-button--delete"
                                            aria-label={`Eliminar ${page.title}`}
                                            title="Eliminar"
                                            onClick={() => handleDelete(page)}
                                        >
                                            <span className="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>
            </div>

            {/* =========================================================
                PREVISUALIZACIÓN
            ========================================================== */}

            <InstitutionalPagePreview
                page={selectedPage}
                onClose={handleClosePreview}
                onEdit={handleEdit}
            />

            {/* =========================================================
                MODAL ELIMINAR
            ========================================================== */}

            {pageToDelete && (
                <div
                    className="institutional-delete-overlay"
                    onClick={cancelDelete}
                >
                    <div
                        className="institutional-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="institutional-delete-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="institutional-delete-title">
                            Eliminar página
                        </h2>

                        <p>
                            ¿Seguro que querés eliminar
                            <strong>{` "${pageToDelete.title}"`}</strong>?
                        </p>

                        <span>Esta acción no se puede deshacer.</span>

                        <div className="institutional-delete-actions">
                            <button
                                type="button"
                                className="institutional-delete-cancel"
                                onClick={cancelDelete}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="institutional-delete-confirm"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PanelLayout>
    );
}