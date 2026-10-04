import React from 'react';
import { Link } from '@inertiajs/react';

export default function MonthNews({ news = [], info = null }) {

    if (!info || news.length === 0) {
        return null;
    }

    const monthName =
        info.name.charAt(0).toUpperCase() + info.name.slice(1);

    return (
        <div className="portal-month-news">

            <div className="portal-news__header">
                <div>
                    <span className="portal-news__eyebrow">
                        Este mes
                    </span>

                    <h2 className="portal-news__title">
                        Más noticias de {monthName}
                    </h2>
                </div>

                {info.total > news.length && (
                    <a
                        href={`/noticias?year=${info.year}&month=${info.month}`}
                        className="portal-news__archive-link"
                    >
                        Ver todas las de {info.name}
                        <span className="material-symbols-outlined">
                            arrow_forward
                        </span>
                    </a>
                )}
            </div>

            <div className="portal-month-news__grid">

                {news.map((item) => {

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

        </div>
    );
}