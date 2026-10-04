import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PanelLayout from '@/Layouts/PanelLayout';

import './css/dashboard.css';

export default function Dashboard({
    news,
    counts,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [month, setMonth] = useState(filters?.month ?? '');
    const [year, setYear] = useState(filters?.year ?? '');
    const [newsToDelete, setNewsToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Eliminar noticia
    |--------------------------------------------------------------------------
    */

    const confirmDelete = () => {
        if (!newsToDelete) {
            return;
        }

        router.delete(route('news.destroy', newsToDelete.id), {
            preserveScroll: true,

            onStart: () => setDeleting(true),

            onFinish: () => {
                setDeleting(false);
                setNewsToDelete(null);
            },
        });
    };

    const cancelDelete = () => {
        if (!deleting) {
            setNewsToDelete(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Aplicar filtros
    |--------------------------------------------------------------------------
    */

    const applyFilters = (extraFilters = {}) => {
        const params = {
            search,
            month,
            year,
            status: filters?.status ?? 'all',
            ...extraFilters,
        };

        // Eliminar filtros vacíos
        Object.keys(params).forEach((key) => {
            if (
                params[key] === '' ||
                params[key] === null ||
                params[key] === undefined
            ) {
                delete params[key];
            }
        });

        router.get(
            route('news.dashboard'),
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Buscar
    |--------------------------------------------------------------------------
    */

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            applyFilters();
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar estado
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = (status) => {
        applyFilters({
            status,
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar mes
    |--------------------------------------------------------------------------
    */

    const handleMonthChange = (event) => {
        const value = event.target.value;

        setMonth(value);

        router.get(
            route('news.dashboard'),
            {
                search,
                month: value,
                year,
                status: filters?.status ?? 'all',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar año
    |--------------------------------------------------------------------------
    */

    const handleYearChange = (event) => {
        const value = event.target.value;

        setYear(value);

        router.get(
            route('news.dashboard'),
            {
                search,
                month,
                year: value,
                status: filters?.status ?? 'all',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };


    return (
        <PanelLayout>

            <Head title="Noticias" />

            <div className="communication-news">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="news-header">

                    <div>

                        <h1>
                            Noticias
                        </h1>

                        <p>
                            Gestioná las noticias y novedades del Hospital Universitario.
                        </p>

                    </div>


                    <Link
                        href={route('news.create')}
                        className="news-create-button"
                    >

                        <span className="material-symbols-outlined">
                            add
                        </span>

                        Crear noticia

                    </Link>

                </div>


                {/* =====================================================
                    FILTROS
                ====================================================== */}

                <div className="news-toolbar">

                    {/* BUSCADOR */}

                    <div className="news-search">

                        <span className="material-symbols-outlined">
                            search
                        </span>

                        <input
                            type="text"
                            placeholder="Buscar noticia..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />

                    </div>


                    {/* MES */}

                    <select
                        value={month}
                        onChange={handleMonthChange}
                        className="news-filter"
                    >

                        <option value="">
                            Mes
                        </option>

                        <option value="1">Enero</option>
                        <option value="2">Febrero</option>
                        <option value="3">Marzo</option>
                        <option value="4">Abril</option>
                        <option value="5">Mayo</option>
                        <option value="6">Junio</option>
                        <option value="7">Julio</option>
                        <option value="8">Agosto</option>
                        <option value="9">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>

                    </select>


                    {/* AÑO */}

                    <select
                        value={year}
                        onChange={handleYearChange}
                        className="news-filter"
                    >

                        <option value="">
                            Año
                        </option>

                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>

                    </select>

                </div>


                {/* =====================================================
                    ESTADOS
                ====================================================== */}

                <div className="news-status-tabs">

                    <button
                        type="button"
                        className={
                            !filters?.status ||
                            filters.status === 'all'
                                ? 'active'
                                : ''
                        }
                        onClick={() => handleStatusChange('all')}
                    >

                        Todas

                        <span>
                            {counts?.all ?? 0}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            filters?.status === 'published'
                                ? 'active'
                                : ''
                        }
                        onClick={() => handleStatusChange('published')}
                    >

                        Publicadas

                        <span>
                            {counts?.published ?? 0}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            filters?.status === 'scheduled'
                                ? 'active'
                                : ''
                        }
                        onClick={() => handleStatusChange('scheduled')}
                    >

                        Programadas

                        <span>
                            {counts?.scheduled ?? 0}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            filters?.status === 'draft'
                                ? 'active'
                                : ''
                        }
                        onClick={() => handleStatusChange('draft')}
                    >

                        Borradores

                        <span>
                            {counts?.draft ?? 0}
                        </span>

                    </button>

                </div>


                {/* =====================================================
                    LISTADO
                ====================================================== */}

                <section className="news-list">

                    {/* CABECERA */}

                    <div className="news-list-header">

                        <span>
                            Noticia
                        </span>

                        <span>
                            Usuario
                        </span>

                        <span>
                            Fecha
                        </span>

                        <span>
                            Estado
                        </span>

                        <span>
                            Acciones
                        </span>

                    </div>


                    {/* NOTICIAS */}

                    {news?.data?.length > 0 ? (

                        news.data.map((item) => (

                            <article
                                key={item.id}
                                className="news-row"
                            >

                                {/* NOTICIA */}

                                <div className="news-item">

                                    <div className="news-thumbnail">

                                        {item.media?.length > 0 ? (

                                            <img
                                                src={`/storage/${
                                                    item.media.find(
                                                        (media) =>
                                                            media.is_featured
                                                    )?.path
                                                    ?? item.media[0]?.path
                                                }`}
                                                alt={item.title}
                                            />

                                        ) : (

                                            <span className="material-symbols-outlined">
                                                image
                                            </span>

                                        )}

                                    </div>


                                    <div className="news-item-title">
                                        {item.title}
                                    </div>

                                </div>


                                {/* USUARIO */}

                                <div className="news-user">

                                    {item.user
                                        ? `${item.user.name} ${item.user.last_name ?? ''}`.trim()
                                        : '—'
                                    }

                                </div>


                                {/* FECHA */}

                                <div className="news-date">

                                    {item.created_at
                                        ? new Date(
                                            item.created_at
                                        ).toLocaleDateString('es-AR')
                                        : '—'
                                    }

                                </div>


                                {/* ESTADO */}

                                <div className="news-status">

                                    <span
                                        className={`status-badge status-${item.status}`}
                                    >

                                        {item.status === 'published' &&
                                            'Publicada'
                                        }

                                        {item.status === 'scheduled' &&
                                            'Programada'
                                        }

                                        {item.status === 'draft' &&
                                            'Borrador'
                                        }

                                    </span>

                                </div>


                                {/* ACCIONES */}

                                <div className="news-actions">

                                    <Link
                                        href={route(
                                            'news.edit',
                                            item.id
                                        )}
                                        className="news-action-button"
                                        aria-label="Editar noticia"
                                    >

                                        <span className="material-symbols-outlined">
                                            edit
                                        </span>

                                    </Link>


                                    <button
                                        type="button"
                                        className="news-action-button delete"
                                        aria-label="Eliminar noticia"
                                        onClick={() => setNewsToDelete(item)}
                                    >

                                        <span className="material-symbols-outlined">
                                            delete
                                        </span>

                                    </button>

                                </div>

                            </article>

                        ))

                    ) : (

                        <div className="news-empty">

                            <span className="material-symbols-outlined">
                                newspaper
                            </span>

                            <p>
                                No hay noticias para mostrar.
                            </p>

                        </div>

                    )}

                </section>


                {/* =====================================================
                    PAGINACIÓN
                ====================================================== */}

                {news?.links?.length > 3 && (

                    <div className="news-pagination">

                        {news.links.map((link, index) => (

                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={
                                    link.active
                                        ? 'active'
                                        : ''
                                }
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />

                        ))}

                    </div>

                )}

            </div>


            {/* =====================================================
                MODAL ELIMINAR
            ====================================================== */}

            {newsToDelete && (

                <div
                    className="news-delete-overlay"
                    onClick={cancelDelete}
                >

                    <div
                        className="news-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <h2>
                            Eliminar noticia
                        </h2>

                        <p>
                            ¿Seguro que querés eliminar
                            <strong>{` "${newsToDelete.title}"`}</strong>?
                        </p>

                        <span>
                            Esta acción no se puede deshacer.
                        </span>

                        <div className="news-delete-actions">

                            <button
                                type="button"
                                className="news-delete-cancel"
                                onClick={cancelDelete}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="news-delete-confirm"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </PanelLayout>
    );
}