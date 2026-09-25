import React from 'react';

import Navbar from '@/Components/Portal/Navbar/Navbar';
import Hero from '@/Components/Portal/Hero/Hero';
import QuickLinks from '@/Components/Portal/QuickLinks/QuickLinks';
import NewsSection from '@/Components/Portal/News/NewsSection';

export default function Welcome({
    menuItems = [],
    quickLinks = [],
    featuredNews = null,
    popularNews = [],
}) {
    return (
        <>
            <Navbar menuItems={menuItems} />

            <main>
                <Hero />

                <QuickLinks quickLinks={quickLinks} />

                <NewsSection
                    featuredNews={featuredNews}
                    popularNews={popularNews}
                />
            </main>
        </>
    );
}