import React, { useEffect, useRef, useState } from "react";

export default function MenuItemActions({
    item,
    onAddChild,
    onEdit,
    onDelete,
    isOpen,
    onToggle,
    onClose,
}) {
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
    });

    const [openDirection, setOpenDirection] = useState("down");

    const DROPDOWN_WIDTH = 205;
    const DROPDOWN_HEIGHT = 150;
    const OFFSET = 7;
    const VIEWPORT_PADDING = 10;

    const calculatePosition = () => {
        if (!buttonRef.current) {
            return;
        }

        const rect = buttonRef.current.getBoundingClientRect();

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        /*
         * ---------------------------------------------------------
         * VERTICAL
         * ---------------------------------------------------------
         */

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        const shouldOpenUp =
            spaceBelow < DROPDOWN_HEIGHT + OFFSET &&
            spaceAbove >= DROPDOWN_HEIGHT + OFFSET;

        const direction = shouldOpenUp ? "up" : "down";

        setOpenDirection(direction);

        let top;

        if (direction === "up") {
            top = rect.top - DROPDOWN_HEIGHT - OFFSET;
        } else {
            top = rect.bottom + OFFSET;
        }

        /*
         * ---------------------------------------------------------
         * HORIZONTAL
         * ---------------------------------------------------------
         */

        let left = rect.right - DROPDOWN_WIDTH;

        if (left < VIEWPORT_PADDING) {
            left = VIEWPORT_PADDING;
        }

        if (
            left + DROPDOWN_WIDTH >
            viewportWidth - VIEWPORT_PADDING
        ) {
            left =
                viewportWidth -
                DROPDOWN_WIDTH -
                VIEWPORT_PADDING;
        }

        /*
         * ---------------------------------------------------------
         * SEGURIDAD
         * ---------------------------------------------------------
         */

        top = Math.max(
            VIEWPORT_PADDING,
            Math.min(
                top,
                viewportHeight -
                    DROPDOWN_HEIGHT -
                    VIEWPORT_PADDING
            )
        );

        setDropdownPosition({
            top,
            left,
        });
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        calculatePosition();

        const handleResize = () => {
            calculatePosition();
        };

        const handleScroll = () => {
            calculatePosition();
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener(
                "scroll",
                handleScroll,
                true
            );
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event) => {
            if (
                buttonRef.current?.contains(event.target) ||
                dropdownRef.current?.contains(event.target)
            ) {
                return;
            }

            onClose();
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [isOpen, onClose]);

    const handleAddChild = () => {
        onClose();
        onAddChild(item);
    };

    const handleEdit = () => {
        onClose();
        onEdit(item);
    };

    const handleDelete = () => {
        onClose();
        onDelete(item);
    };

    const handleToggle = () => {
        if (!isOpen) {
            calculatePosition();
        }

        onToggle(item.id);
    };

    return (
        <div className="menu-item-actions-menu">
            <button
                ref={buttonRef}
                type="button"
                className="menu-item-more-button"
                onClick={handleToggle}
                aria-label="Más acciones"
                aria-expanded={isOpen}
            >
                <span />
                <span />
                <span />
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`menu-item-dropdown menu-item-dropdown--${openDirection}`}
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                    }}
                >
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