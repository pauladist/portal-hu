import React from 'react';
import { Head, Link } from '@inertiajs/react';

import Navbar from '@/Components/Portal/Navbar/Navbar';
import Hero from '@/Components/Portal/Hero/Hero';
import QuickLinks from '@/Components/Portal/QuickLinks/QuickLinks';

import './css/news-pages.css';

const formatDate = (value) =>
    new Date(value).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

export default function Show({
    news,
    relatedNews = [],
    menuItems = [],
    quickLinks = [],
}) {
    // Vuelve a la página anterior (home, historial con sus filtros, etc.).
    // Si no hay historial (ej: se abrió en una pestaña nueva), va al historial.
    const handleBack = (event) => {
        if (window.history.length > 1) {
            event.preventDefault();
            window.history.back();
        }
    };

    const cover =
        news.media?.find(
            (media) => media.type === 'image' && media.is_featured
        ) ?? null;

    return (
        <>
            <Head title={news.title} />

            <Navbar menuItems={menuItems} />

            <main>
                <Hero />

                <QuickLinks quickLinks={quickLinks} />

                <section className="portal-archive">
                    <div className="portal-archive__container">

                        <article className="portal-news-show">

                            <a
                                href="/noticias"
                                className="portal-news-show__back"
                                onClick={handleBack}
                            >
                                <span className="material-symbols-outlined">
                                    arrow_back
                                </span>
                                Volver
                            </a>

                            {/* ENCABEZADO */}
                            <header className="portal-news-show__header">

                                {news.categories?.length > 0 && (
                                    <div className="portal-news-show__categories">
                                        {news.categories.map((category) => (
                                            <span key={category.id}>
                                                {category.title}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <h2 className="portal-news-show__title">
                                    {news.title}
                                </h2>

                                {news.subtitle && (
                                    <p className="portal-news-show__subtitle">
                                        {news.subtitle}
                                    </p>
                                )}

                                <div className="portal-news-show__meta">
                                    <span>
                                        <span className="material-symbols-outlined">
                                            calendar_today
                                        </span>
                                        {formatDate(news.published_at)}
                                    </span>

                                    <span>
                                        <span className="material-symbols-outlined">
                                            visibility
                                        </span>
                                        {news.views}{' '}
                                        {news.views === 1 ? 'vista' : 'vistas'}
                                    </span>
                                </div>
                            </header>

                            {/* PORTADA */}
                            {cover && (
                                <img
                                    src={`/storage/${cover.path}`}
                                    alt={cover.title || news.title}
                                    className="portal-news-show__cover"
                                />
                            )}

                            {/* CONTENIDO COMPLETO */}
                            <div
                                className="portal-news-show__content"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />

                            {/* TAGS */}
                            {news.tags?.length > 0 && (
                                <footer className="portal-news-show__tags">
                                    {news.tags.map((tag) => (
                                        <span key={tag.id}>#{tag.title}</span>
                                    ))}
                                </footer>
                            )}

                        </article>

                        {/* MÁS NOTICIAS */}
                        {relatedNews.length > 0 && (
                            <section className="portal-news-related">
                                <h2 className="portal-news-related__title">
                                    Más noticias
                                </h2>

                                <div className="portal-archive__grid">
                                    {relatedNews.map((item) => {
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
                                                        {formatDate(
                                                            item.published_at
                                                        )}
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
                            </section>
                        )}

                    </div>
                </section>
            </main>
        </>
    );
}