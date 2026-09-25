import React from 'react';

export default function FeaturedNews({ news }) {
    if (!news) {
        return null;
    }

    const featuredImage = news.media?.[0];

    return (
        <article className="portal-featured-news">

            {featuredImage && (
                <img
                    src={featuredImage.path}
                    alt={featuredImage.title || news.title}
                    className="portal-featured-news__image"
                />
            )}

            <div className="portal-featured-news__content">

                <span className="portal-featured-news__date">
                    {new Date(news.published_at).toLocaleDateString(
                        'es-AR',
                        {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        }
                    )}
                </span>

                <h3 className="portal-featured-news__title">
                    {news.title}
                </h3>

                {news.subtitle && (
                    <p className="portal-featured-news__subtitle">
                        {news.subtitle}
                    </p>
                )}

            </div>

        </article>
    );
}