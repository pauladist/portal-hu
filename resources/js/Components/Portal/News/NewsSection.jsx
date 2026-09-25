import React from 'react';
import FeaturedNews from './FeaturedNews';
import PopularNews from './PopularNews';
import './news.css';

export default function NewsSection({
    featuredNews,
    popularNews = [],
}) {
    return (
        <section className="portal-news">
            <div className="portal-news__container">

                <div className="portal-news__header">
                    <div>
                        <span className="portal-news__eyebrow">
                            Noticias
                        </span>

                        <h2 className="portal-news__title">
                            Últimas novedades
                        </h2>
                    </div>
                </div>

                <div className="portal-news__grid">

                    <FeaturedNews news={featuredNews} />

                    <PopularNews news={popularNews} />

                </div>

            </div>
        </section>
    );
}