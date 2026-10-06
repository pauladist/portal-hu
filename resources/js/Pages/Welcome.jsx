import React from 'react';

import Navbar from '@/Components/Portal/Navbar/Navbar';
import Hero from '@/Components/Portal/Hero/Hero';
import QuickLinks from '@/Components/Portal/QuickLinks/QuickLinks';
import NewsSection from '@/Components/Portal/News/NewsSection';

export default function Welcome({
    menuItems = [],
    quickLinks = [],
    latestNews = [],
    popularNews = [],
    monthNews = [],
    monthInfo = null,
}) {
    return (
        <>
            <Navbar menuItems={menuItems} />

            <main>
                <Hero />

                <QuickLinks quickLinks={quickLinks} />

                <NewsSection
                    latestNews={latestNews}
                    popularNews={popularNews}
                    monthNews={monthNews}
                    monthInfo={monthInfo}
                />
            </main>

            <footer className="portal-footer">
                © {new Date().getFullYear()} Hospital Universitario · Mendoza, Argentina
            </footer>
        </>
    );
}