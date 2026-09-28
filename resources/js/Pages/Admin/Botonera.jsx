import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

import PanelLayout from '../../Layouts/PanelLayout';

import './Botonera.css';

export default function Botonera({ menuItems = [] }) {
    return (
        <PanelLayout title="Botonera">
            <div className="botonera-page">

                <div className="botonera-header">
                    <div>
                        <h1>Botonera</h1>
                        <p>
                            Administrá la estructura de navegación del portal.
                        </p>
                    </div>
                </div>

                <div className="botonera-content">
                    {menuItems.length === 0 ? (
                        <div className="botonera-empty">
                            <h3>No hay botones cargados</h3>
                            <p>
                                Todavía no hay elementos en la botonera.
                            </p>
                        </div>
                    ) : (
                        <div className="menu-tree">
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    item={item}
                                    level={0}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </PanelLayout>
    );
}

/**
 * Elemento recursivo de la botonera.
 * Permite manejar:
 * Principal
 *   └── Hijo
 *        └── Nieto
 *             └── etc.
 */
function MenuItem({ item, level }) {
    const [isOpen, setIsOpen] = useState(false);

    const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;

    const destination = getDestination(item);

    return (
        <div className={`menu-item-wrapper menu-level-${level}`}>
            <div className="menu-item-card">
                <div className="menu-item-main">
                    {hasChildren && (
                        <button
                            type="button"
                            className={`menu-expand-button ${
                                isOpen ? "is-open" : ""
                            }`}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={
                                isOpen
                                    ? "Contraer elemento"
                                    : "Expandir elemento"
                            }
                        >
                            <span />
                        </button>
                    )}

                    {!hasChildren && (
                        <div className="menu-expand-placeholder" />
                    )}

                    <div className="menu-item-info">
                        <div className="menu-item-title-row">
                            <h3>{item.title}</h3>

                            <span
                                className={`menu-status ${
                                    item.is_active
                                        ? "status-active"
                                        : "status-inactive"
                                }`}
                            >
                                {item.is_active ? "Activo" : "Inactivo"}
                            </span>

                            {item.is_quick_link && (
                                <span className="menu-quick-link">
                                    Acceso rápido
                                </span>
                            )}
                        </div>

                        <div className="menu-item-meta">
                            {hasChildren && (
                                <span>
                                    {item.children.length}{" "}
                                    {item.children.length === 1
                                        ? "elemento"
                                        : "elementos"}
                                </span>
                            )}

                            <span className="menu-destination">
                                {destination}
                            </span>
                        </div>
                    </div>

                    <div className="menu-item-actions">
                        <button type="button" className="menu-action-button">
                            Editar
                        </button>
                    </div>
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="menu-children">
                    {item.children.map((child) => (
                        <MenuItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Determina qué mostrar como destino.
 */
function getDestination(item) {
    if (item.destination_type === "url" && item.url) {
        return "URL";
    }

    if (item.destination_type === "pdf" && item.file_path) {
        return "PDF";
    }

    return "Sin destino";
}
