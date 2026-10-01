import React from 'react';

export default function QuickLinkCard({ item }) {
    const getItemHref = () => {
        if (item.destination_type === "pdf" && item.file_path) {
            return `/storage/${item.file_path}`;
        }

        return item.url ?? "#";
    };

    return (
        <a
            href={getItemHref()}
            className="portal-quick-link-card"
        >
            <span className="portal-quick-link-card__title">
                {item.title}
            </span>
        </a>
    );
}