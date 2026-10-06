import React from 'react';
import { Head } from '@inertiajs/react';

import Navbar from '@/Components/Portal/Navbar/Navbar';
import Hero from '@/Components/Portal/Hero/Hero';
import QuickLinks from '@/Components/Portal/QuickLinks/QuickLinks';

import './css/institutional-page.css';

export default function Show({
    page,
    menuItems = [],
    quickLinks = [],
}) {
    return (
        <>
            <Head title={page.title} />

            <Navbar menuItems={menuItems} />

            <main>
                <Hero />

                <QuickLinks quickLinks={quickLinks} />

                <section className="portal-page">
                    <div className="portal-page__container">
                        <header className="portal-page__header">
                            <span className="portal-page__eyebrow">
                                Institucional
                            </span>

                            <h2 className="portal-page__title">
                                {page.title}
                            </h2>

                            {page.subtitle && (
                                <p className="portal-page__subtitle">
                                    {page.subtitle}
                                </p>
                            )}
                        </header>

                        {page.content ? (
                            <div
                                className="portal-page__content"
                                dangerouslySetInnerHTML={{
                                    __html: page.content,
                                }}
                            />
                        ) : (
                            <p className="portal-page__empty">
                                Esta página todavía no tiene contenido.
                            </p>
                        )}
                    </div>
                </section>
            </main>

            <footer className="portal-footer">
                © {new Date().getFullYear()} Hospital Universitario · Mendoza, Argentina
            </footer>
        </>
    );
}