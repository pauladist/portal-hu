import React from 'react';
import NewsCarousel from './NewsCarousel';
import PopularNews from './PopularNews';
import MonthNews from './MonthNews';
import './news.css';

export default function NewsSection({
    latestNews = [],
    popularNews = [],
    monthNews = [],
    monthInfo = null,
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

                    <a
                        href="/noticias"
                        className="portal-news__archive-link"
                    >
                        Ver historial de noticias
                        <span className="material-symbols-outlined">
                            arrow_forward
                        </span>
                    </a>
                </div>

                <div className="portal-news__grid">

                    <NewsCarousel news={latestNews} />

                    <PopularNews news={popularNews} />

                </div>

                <MonthNews news={monthNews} info={monthInfo} />

            </div>
        </section>
    );
}