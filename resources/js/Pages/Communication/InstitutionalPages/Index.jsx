import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";

import PanelLayout from "@/Layouts/PanelLayout";

import InstitutionalPagePreview from "./components/InstitutionalPagePreview";

import "./css/index.css";

export default function Index({ pages = [] }) {
    const [search, setSearch] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);

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
        setOpenMenu(null);
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
        setOpenMenu(null);
        setSelectedPage(null);

        router.visit(route("institutional-pages.edit", page.id));
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const handleDelete = (page) => {
        setOpenMenu(null);

        const confirmed = window.confirm(
            `¿Querés eliminar la página "${page.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(route("institutional-pages.destroy", page.id));
    };

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
    | Imagen de portada
    |--------------------------------------------------------------------------
    */

    const getPageImage = (page) => {
        if (!Array.isArray(page.media)) {
            return null;
        }

        const image = page.media.find((media) => media.type === "image");

        if (!image) {
            return null;
        }

        return `/storage/${image.path}`;
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
                            const image = getPageImage(page);

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
                                        IMAGEN
                                    ================================== */}

                                    <div className="institutional-page-card__image">
                                        {image ? (
                                            <img src={image} alt="" />
                                        ) : (
                                            <div className="institutional-page-card__placeholder">
                                                <span className="material-symbols-outlined">
                                                    account_balance
                                                </span>
                                            </div>
                                        )}
                                    </div>

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
                                    >
                                        <button
                                            type="button"
                                            className="institutional-page-card__menu-button"
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu === page.id
                                                        ? null
                                                        : page.id,
                                                )
                                            }
                                            aria-label={`Acciones para ${page.title}`}
                                        >
                                            <span className="material-symbols-outlined">
                                                more_vert
                                            </span>
                                        </button>

                                        {openMenu === page.id && (
                                            <div className="institutional-page-card__menu">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(page)
                                                    }
                                                >
                                                    <span className="material-symbols-outlined">
                                                        edit
                                                    </span>
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="institutional-page-card__menu-danger"
                                                    onClick={() =>
                                                        handleDelete(page)
                                                    }
                                                >
                                                    <span className="material-symbols-outlined">
                                                        delete
                                                    </span>
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
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
        </PanelLayout>
    );
}
