import React from 'react';

export default function QuickLinkCard({ item }) {
    return (
        <a
            href={item.url ?? '#'}
            className="portal-quick-link-card"
        >
            <span className="portal-quick-link-card__title">
                {item.title}
            </span>
        </a>
    );
}