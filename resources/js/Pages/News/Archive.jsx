import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

import Navbar from '@/Components/Portal/Navbar/Navbar';
import Hero from '@/Components/Portal/Hero/Hero';
import QuickLinks from '@/Components/Portal/QuickLinks/QuickLinks';

import './css/news-pages.css';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function Archive({
    news,
    years = [],
    months = {},
    filters = {},
    menuItems = [],
    quickLinks = [],
}) {
    const year = filters.year ? Number(filters.year) : null;
    const month = filters.month ? Number(filters.month) : null;

    const applyFilters = (params) => {
        router.get('/noticias', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const selectYear = (value) => {
        applyFilters(value && value !== year ? { year: value } : {});
    };

    const selectMonth = (value) => {
        applyFilters(
            value === month ? { year } : { year, month: value }
        );
    };

    const periodLabel = year
        ? month
            ? `${MONTHS[month - 1]} ${year}`
            : `${year}`
        : 'Todas las noticias';

    const pageLinks = news.links ?? [];
    const prevLink = pageLinks[0];
    const nextLink = pageLinks[pageLinks.length - 1];
    const numberLinks = pageLinks.slice(1, -1);

    return (
        <>
            <Head title="Historial de noticias" />

            <Navbar menuItems={menuItems} />

            <main>
                <Hero />

                <QuickLinks quickLinks={quickLinks} />

                <section className="portal-archive">
                    <div className="portal-archive__container">

                        <header className="portal-archive__header">
                            <span className="portal-archive__eyebrow">
                                Noticias
                            </span>

                            <h2 className="portal-archive__title">
                                Historial de noticias
                            </h2>
                        </header>

                        {/* FILTROS */}
                        <section className="portal-archive__filters">

                            <div className="portal-archive__filter-group">
                                <span className="portal-archive__filter-label">
                                    Año
                                </span>

                                <div className="portal-archive__chips">
                                    <button
                                        type="button"
                                        className={`portal-archive__chip ${
                                            !year ? 'is-active' : ''
                                        }`}
                                        onClick={() => applyFilters({})}
                                    >
                                        Todos
                                    </button>

                                    {years.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`portal-archive__chip ${
                                                year === value ? 'is-active' : ''
                                            }`}
                                            onClick={() => selectYear(value)}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {year && (
                                <div className="portal-archive__filter-group">
                                    <span className="portal-archive__filter-label">
                                        Mes
                                    </span>

                                    <div className="portal-archive__chips">
                                        {MONTHS.map((name, index) => {
                                            const number = index + 1;
                                            const count = months[number] ?? 0;

                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    disabled={count === 0}
                                                    className={`portal-archive__chip ${
                                                        month === number
                                                            ? 'is-active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        selectMonth(number)
                                                    }
                                                >
                                                    {name}
                                                    {count > 0 && (
                                                        <small>{count}</small>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* RESUMEN */}
                        <p className="portal-archive__summary">
                            <strong>{periodLabel}</strong>
                            {' · '}
                            {news.total}{' '}
                            {news.total === 1 ? 'noticia' : 'noticias'}
                        </p>

                        {/* LISTADO */}
                        {news.data.length === 0 ? (
                            <p className="portal-archive__empty">
                                No hay noticias publicadas en este período.
                            </p>
                        ) : (
                            <div className="portal-archive__grid">
                                {news.data.map((item) => {
                                    const image = item.media?.[0];

                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/noticias/${item.slug}`}
                                            className="portal-archive-card"
                                        >
                                            <div className="portal-archive-card__image-wrapper">
                                                {image && (
                                                    <img
                                                        src={`/storage/${image.path}`}
                                                        alt={
                                                            image.title ||
                                                            item.title
                                                        }
                                                        className="portal-archive-card__image"
                                                    />
                                                )}
                                            </div>

                                            <div className="portal-archive-card__content">
                                                <span className="portal-archive-card__date">
                                                    {new Date(
                                                        item.published_at
                                                    ).toLocaleDateString('es-AR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>

                                                <h3 className="portal-archive-card__title">
                                                    {item.title}
                                                </h3>

                                                {item.subtitle && (
                                                    <p className="portal-archive-card__subtitle">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* PAGINACIÓN */}
                        {news.last_page > 1 && (
                            <nav
                                className="portal-archive__pagination"
                                aria-label="Paginación"
                            >
                                {prevLink?.url ? (
                                    <Link
                                        href={prevLink.url}
                                        preserveScroll
                                        className="portal-archive__page"
                                    >
                                        Anterior
                                    </Link>
                                ) : (
                                    <span className="portal-archive__page is-disabled">
                                        Anterior
                                    </span>
                                )}

                                {numberLinks.map((link) =>
                                    link.url ? (
                                        <Link
                                            key={link.label}
                                            href={link.url}
                                            preserveScroll
                                            className={`portal-archive__page ${
                                                link.active ? 'is-active' : ''
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={link.label}
                                            className="portal-archive__page is-disabled"
                                        >
                                            {link.label}
                                        </span>
                                    )
                                )}

                                {nextLink?.url ? (
                                    <Link
                                        href={nextLink.url}
                                        preserveScroll
                                        className="portal-archive__page"
                                    >
                                        Siguiente
                                    </Link>
                                ) : (
                                    <span className="portal-archive__page is-disabled">
                                        Siguiente
                                    </span>
                                )}
                            </nav>
                        )}

                    </div>
                </section>
            </main>
        </>
    );
}