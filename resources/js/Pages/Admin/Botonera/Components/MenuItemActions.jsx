import React, { useState } from 'react';

export default function MenuItemActions({
    item,
    onAddChild,
    onEdit,
    onDelete,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
    };

    const handleAddChild = () => {
        closeMenu();
        onAddChild(item);
    };

    const handleEdit = () => {
        closeMenu();
        onEdit(item);
    };

    const handleDelete = () => {
        closeMenu();
        onDelete(item);
    };

    return (
        <div className="menu-item-actions-menu">

            <button
                type="button"
                className="menu-item-more-button"
                onClick={() =>
                    setIsOpen((current) => !current)
                }
                aria-label="Más acciones"
                aria-expanded={isOpen}
            >
                <span />
                <span />
                <span />
            </button>

            {isOpen && (
                <div className="menu-item-dropdown">

                    <button
                        type="button"
                        onClick={handleAddChild}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M12 5V19"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M5 12H19"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>

                        Agregar subelemento
                    </button>

                    <button
                        type="button"
                        onClick={handleEdit}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinejoin="round"
                            />
                        </svg>

                        Editar
                    </button>

                    <button
                        type="button"
                        className="is-danger"
                        onClick={handleDelete}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M5 7H19"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M10 11V17"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M14 11V17"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M8 7L9 19H15L16 7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />

                            <path
                                d="M9 7L10 4H14L15 7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                        </svg>

                        Eliminar
                    </button>

                </div>
            )}

        </div>
    );
}