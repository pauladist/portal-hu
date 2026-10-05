import React from 'react';
import { getMenuItemLinkProps } from '@/Utils/menuLinks';

export default function QuickLinkCard({ item }) {
    return (
        <a
            {...getMenuItemLinkProps(item)}
            className="portal-quick-link-card"
        >
            <span className="portal-quick-link-card__title">
                {item.title}
            </span>
        </a>
    );
}