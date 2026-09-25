import React from 'react';
import QuickLinkCard from './QuickLinkCard';
import './quick-links.css';

export default function QuickLinks({ quickLinks = [] }) {
    return (
        <section className="portal-quick-links">
            <div className="portal-quick-links__container">
                {quickLinks.map((item) => (
                    <QuickLinkCard
                        key={item.id}
                        item={item}
                    />
                ))}
            </div>
        </section>
    );
}