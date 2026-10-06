import React, { useEffect, useState } from 'react';
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

/* Imagen ampliada (portada o imágenes del contenido) */
function ImageLightbox({ image = null, onClose }) {
    useEffect(() => {
        if (!image) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [image, onClose]);

    if (!image) {
        return null;
    }

    return (
        <div
            className="portal-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada"
            onClick={onClose}
        >
            <button
                type="button"
                className="portal-lightbox__close"
                onClick={onClose}
                aria-label="Cerrar imagen"
            >
                <span className="material-symbols-outlined">
                    close
                </span>
            </button>

            <img
                src={image.src}
                alt={image.alt}
                className="portal-lightbox__image"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

export default function Show({
    news,
    previousNews = null,
    nextNews = null,
    relatedNews = [],
    menuItems = [],
    quickLinks = [],
}) {
    // Imagen ampliada (portada o imágenes del contenido)
    const [lightboxImage, setLightboxImage] = useState(null);

    const handleContentClick = (event) => {
        if (event.target instanceof HTMLImageElement) {
            setLightboxImage({
                src: event.target.currentSrc || event.target.src,
                alt: event.target.alt,
            });
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
                                href="/"
                                className="portal-news-show__back"
                            >
                                <span className="material-symbols-outlined">
                                    arrow_back
                                </span>
                                Volver al inicio
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
                                <button
                                    type="button"
                                    className="portal-news-show__cover-button"
                                    aria-label="Ampliar imagen de portada"
                                    onClick={() =>
                                        setLightboxImage({
                                            src: `/storage/${cover.path}`,
                                            alt: cover.title || news.title,
                                        })
                                    }
                                >
                                    <img
                                        src={`/storage/${cover.path}`}
                                        alt={cover.title || news.title}
                                        className="portal-news-show__cover"
                                    />
                                </button>
                            )}

                            {/* CONTENIDO COMPLETO */}
                            <div
                                className="portal-news-show__content"
                                onClick={handleContentClick}
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

                            {/* NOTICIA ANTERIOR / SIGUIENTE */}
                            {(previousNews || nextNews) && (
                                <nav
                                    className="portal-news-show__nav"
                                    aria-label="Navegación entre noticias"
                                >
                                    {previousNews ? (
                                        <Link
                                            href={`/noticias/${previousNews.slug}`}
                                            className="portal-news-show__back"
                                        >
                                            <span className="material-symbols-outlined">
                                                arrow_back
                                            </span>
                                            Noticia anterior
                                        </Link>
                                    ) : (
                                        <span />
                                    )}

                                    {nextNews ? (
                                        <Link
                                            href={`/noticias/${nextNews.slug}`}
                                            className="portal-news-show__back"
                                        >
                                            Siguiente noticia
                                            <span className="material-symbols-outlined">
                                                arrow_forward
                                            </span>
                                        </Link>
                                    ) : (
                                        <span />
                                    )}
                                </nav>
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

            <footer className="portal-footer">
                © {new Date().getFullYear()} Hospital Universitario · Mendoza, Argentina
            </footer>

            <ImageLightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        </>
    );
}