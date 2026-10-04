import React from 'react';
import { getMenuItemHref } from '@/Utils/menuLinks';

export default function QuickLinkCard({ item }) {
    return (
        <a
            href={getMenuItemHref(item)}
            className="portal-quick-link-card"
        >
            <span className="portal-quick-link-card__title">
                {item.title}
            </span>
        </a>
    );
}