import React from 'react';

export default function PopularNews({ news = [] }) {
    return (
        <aside className="portal-popular-news">

            <div className="portal-popular-news__header">
                <span className="material-symbols-outlined">
                    trending_up
                </span>

                <h3>
                    Noticias populares
                </h3>
            </div>

            <div className="portal-popular-news__list">

                {news.map((item, index) => {
                    const featuredImage = item.media?.[0];

                    return (
                        <article
                            key={item.id}
                            className="portal-popular-news__item"
                        >
                            <span className="portal-popular-news__number">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            <div className="portal-popular-news__image-wrapper">
                                {featuredImage && (
                                    <img
                                        src={featuredImage.path}
                                        alt={
                                            featuredImage.title ||
                                            item.title
                                        }
                                        className="portal-popular-news__image"
                                    />
                                )}
                            </div>

                            <div className="portal-popular-news__content">
                                <h4>
                                    {item.title}
                                </h4>

                                <span>
                                    {new Date(
                                        item.published_at
                                    ).toLocaleDateString(
                                        'es-AR',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        }
                                    )}
                                </span>
                            </div>
                        </article>
                    );
                })}

            </div>

        </aside>
    );
}