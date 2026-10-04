import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

export default function NewsCarousel({ news = [] }) {
    const total = news.length;

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchStartX = useRef(null);

    const goTo = useCallback(
        (index) => setCurrent(((index % total) + total) % total),
        [total]
    );

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Autoplay (se reinicia al cambiar de slide y se pausa con hover / foco)
    useEffect(() => {
        if (total <= 1 || paused || prefersReducedMotion) {
            return undefined;
        }

        const id = setTimeout(() => goTo(current + 1), AUTOPLAY_MS);

        return () => clearTimeout(id);
    }, [current, paused, total, goTo, prefersReducedMotion]);

    if (total === 0) {
        return null;
    }

    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) {
            return;
        }

        const diff =
            event.changedTouches[0].clientX - touchStartX.current;

        touchStartX.current = null;

        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            goTo(diff < 0 ? current + 1 : current - 1);
        }
    };

    return (
        <section
            className="portal-featured-news portal-carousel"
            aria-roledescription="carrusel"
            aria-label="Últimas noticias"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="portal-carousel__track"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {news.map((item, index) => {
                    const image = item.media?.[0];
                    const active = index === current;

                    return (
                        <Link
                            key={item.id}
                            href={`/noticias/${item.slug}`}
                            className="portal-carousel__slide"
                            aria-hidden={!active}
                            tabIndex={active ? 0 : -1}
                        >
                            {image ? (
                                <img
                                    src={`/storage/${image.path}`}
                                    alt={image.title || item.title}
                                    className="portal-featured-news__image"
                                />
                            ) : (
                                <div className="portal-carousel__placeholder" />
                            )}

                            <div className="portal-featured-news__content">
                                <span className="portal-featured-news__date">
                                    {new Date(
                                        item.published_at
                                    ).toLocaleDateString('es-AR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>

                                <h3 className="portal-featured-news__title">
                                    {item.title}
                                </h3>

                                {item.subtitle && (
                                    <p className="portal-featured-news__subtitle">
                                        {item.subtitle}
                                    </p>
                                )}

                                <span className="portal-featured-news__link">
                                    Leer noticia
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {total > 1 && (
                <div className="portal-carousel__controls">
                    <button
                        type="button"
                        className="portal-carousel__arrow portal-carousel__arrow--prev"
                        onClick={() => goTo(current - 1)}
                        aria-label="Noticia anterior"
                    >
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </button>

                    <button
                        type="button"
                        className="portal-carousel__arrow portal-carousel__arrow--next"
                        onClick={() => goTo(current + 1)}
                        aria-label="Noticia siguiente"
                    >
                        <span className="material-symbols-outlined">
                            chevron_right
                        </span>
                    </button>

                    <div className="portal-carousel__dots">
                        {news.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`portal-carousel__dot ${
                                    index === current ? 'is-active' : ''
                                }`}
                                onClick={() => goTo(index)}
                                aria-label={`Ir a la noticia ${index + 1}`}
                                aria-current={index === current}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}