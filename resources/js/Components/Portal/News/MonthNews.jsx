import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

const PAGE_SIZE = 6;

export default function MonthNews({ news = [], info = null }) {

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    if (!info || news.length === 0) {
        return null;
    }

    const monthName =
        info.name.charAt(0).toUpperCase() + info.name.slice(1);

    const visibleNews = news.slice(0, visibleCount);
    const hasMore = visibleCount < news.length;

    return (
        <div className="portal-month-news">

            <div className="portal-news__header">
                <div>
                    <span className="portal-news__eyebrow">
                        Este mes
                    </span>

                    <h2 className="portal-news__title">
                        Noticias de {monthName}
                    </h2>
                </div>
            </div>

            <div className="portal-month-news__grid">

                {visibleNews.map((item) => {

                    const image = item.media?.[0];

                    return (
                        <Link
                            key={item.id}
                            href={`/noticias/${item.slug}`}
                            className="portal-month-news__card"
                        >

                            <div className="portal-month-news__image-wrapper">

                                {image && (
                                    <img
                                        src={`/storage/${image.path}`}
                                        alt={image.title || item.title}
                                        className="portal-month-news__image"
                                        loading="lazy"
                                    />
                                )}

                            </div>

                            <div className="portal-month-news__content">

                                <span className="portal-month-news__date">
                                    {new Date(
                                        item.published_at
                                    ).toLocaleDateString(
                                        'es-AR',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }
                                    )}
                                </span>

                                <h3 className="portal-month-news__title">
                                    {item.title}
                                </h3>

                                {item.subtitle && (
                                    <p className="portal-month-news__subtitle">
                                        {item.subtitle}
                                    </p>
                                )}

                            </div>

                        </Link>
                    );
                })}

            </div>

            {hasMore && (
                <div className="portal-month-news__actions">
                    <button
                        type="button"
                        className="portal-month-news__more"
                        onClick={() =>
                            setVisibleCount((count) => count + PAGE_SIZE)
                        }
                    >
                        Ver más noticias
                        <span className="material-symbols-outlined">
                            expand_more
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
}