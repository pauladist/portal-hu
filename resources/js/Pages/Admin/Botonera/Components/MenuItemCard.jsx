import React from "react";

import MenuTree from "./MenuTree";
import MenuItemActions from "./MenuItemActions";

export default function MenuItemCard({
    item,
    level,
    isOpen,
    onToggle,
    onToggleStatus,
    onToggleQuickLink,
    quickLinksLimitReached,
    draggedItem,
    onDragStart,
    onDrop,
    onAddChild,
    onEdit,
    onDelete,
    openItems,
    toggleItem,
    toggleStatus,
    toggleQuickLink,
    openActionId,
    toggleActionMenu,
    closeActionMenu,
}) {
    const children = Array.isArray(item.children) ? item.children : [];

    const hasChildren = children.length > 0;

    const quickLinkDisabled = !item.is_quick_link && quickLinksLimitReached;

    return (
        <div className={`menu-item-wrapper menu-level-${level}`}>
            <div
                className={`menu-item-card ${
                    draggedItem?.id === item.id ? "is-dragging" : ""
                }`}
                draggable
                onDragStart={() => onDragStart(item)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(item)}
            >
                {/* DRAG */}

                <div className="menu-item-drag" title="Mover elemento">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                {/* EXPANDIR */}

                <div className="menu-item-expand">
                    {hasChildren ? (
                        <button
                            type="button"
                            className={`menu-item-expand-button ${
                                isOpen ? "is-open" : ""
                            }`}
                            onClick={onToggle}
                            aria-label={
                                isOpen
                                    ? "Contraer elemento"
                                    : "Expandir elemento"
                            }
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M9 6L15 12L9 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    ) : (
                        <span className="menu-item-expand-placeholder" />
                    )}
                </div>

                {/* INFORMACIÓN */}

                <div className="menu-item-main">
                    <div className="menu-item-title-row">
                        <strong>{item.title}</strong>

                        {item.is_quick_link && (
                            <span className="quick-link-badge">
                                Acceso rápido
                            </span>
                        )}
                    </div>

                    {hasChildren && (
                        <span className="menu-item-meta">
                            {children.length}{" "}
                            {children.length === 1 ? "elemento" : "elementos"}
                        </span>
                    )}
                </div>

                {/* ESTADO */}

                <div className="menu-item-status">
                    <button
                        type="button"
                        className={`status-toggle ${
                            item.is_active ? "is-active" : "is-inactive"
                        }`}
                        onClick={onToggleStatus}
                    >
                        <span>{item.is_active ? "Activo" : "Inactivo"}</span>
                    </button>
                </div>

                {/* ACCIONES */}

                <div className="menu-item-actions">
                    {/* ACCESO RÁPIDO */}

                    <button
                        type="button"
                        className={`quick-link-button ${
                            item.is_quick_link ? "is-selected" : ""
                        } ${quickLinkDisabled ? "is-disabled" : ""}`}
                        onClick={onToggleQuickLink}
                        disabled={quickLinkDisabled}
                        title={
                            item.is_quick_link
                                ? "Quitar acceso rápido"
                                : quickLinkDisabled
                                  ? "Ya hay 8 accesos rápidos"
                                  : "Marcar como acceso rápido"
                        }
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill={item.is_quick_link ? "currentColor" : "none"}
                        >
                            <path
                                d="M12 3.8L14.53 8.93L20.2 9.75L16.1 13.75L17.07 19.4L12 16.73L6.93 19.4L7.9 13.75L3.8 9.75L9.47 8.93L12 3.8Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>Acceso rápido</span>{" "}
                    </button>

                    {/* MENÚ ⋮ */}

                    <MenuItemActions
                        item={item}
                        onAddChild={onAddChild}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isOpen={openActionId === item.id}
                        onToggle={toggleActionMenu}
                        onClose={closeActionMenu}
                    />
                </div>
            </div>

            {/* HIJOS */}

            {hasChildren && isOpen && (
                <MenuTree
                    items={children}
                    level={level + 1}
                    openItems={openItems}
                    toggleItem={toggleItem}
                    toggleStatus={toggleStatus}
                    toggleQuickLink={toggleQuickLink}
                    quickLinksLimitReached={quickLinksLimitReached}
                    draggedItem={draggedItem}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                    onAddChild={onAddChild}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    openActionId={openActionId}
                    toggleActionMenu={toggleActionMenu}
                    closeActionMenu={closeActionMenu}
                />
            )}
        </div>
    );
}
