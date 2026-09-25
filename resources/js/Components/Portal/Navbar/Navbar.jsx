import React, { useState } from "react";
import "./Navbar.css";

function NavbarItem({ item, level = 0 }) {
    const hasChildren = item.children?.length > 0;

    const [openDirection, setOpenDirection] = useState('center');

    const itemRef = React.useRef(null);

    const handleMouseEnter = () => {
        if (!hasChildren) {
            return;
        }

        const element = itemRef.current;

        if (!element) {
            return;
        }

        const rect = element.getBoundingClientRect();

        const dropdownWidth = 250;

        if (level === 0) {
            // Dropdown de primer nivel: se centra con left:50%,
            // así que puede desbordar tanto por derecha como por izquierda.
            const center = rect.left + rect.width / 2;
            const spaceRight = window.innerWidth - center;
            const spaceLeft = center;

            if (spaceRight < dropdownWidth / 2) {
                setOpenDirection('edge-left');
            } else if (spaceLeft < dropdownWidth / 2) {
                setOpenDirection('right');
            } else {
                setOpenDirection('center');
            }

            return;
        }

        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;

        if (
            spaceRight < dropdownWidth &&
            spaceLeft >= dropdownWidth
        ) {
            setOpenDirection('left');
        } else {
            setOpenDirection('right');
        }
    };

    return (
        <div
            ref={itemRef}
            onMouseEnter={handleMouseEnter}
            className={`portal-navbar__item-wrapper ${
                hasChildren
                    ? 'portal-navbar__item-wrapper--has-children'
                    : ''
            } ${
                level === 0
                    ? openDirection !== 'center'
                        ? `portal-navbar__item-wrapper--dropdown-${openDirection}`
                        : ''
                    : openDirection === 'left'
                        ? 'portal-navbar__item-wrapper--dropdown-left'
                        : ''
            }`}
        >
            <a
                href={hasChildren ? '#' : item.url ?? '#'}
                className="portal-navbar__item"
            >
                <span>{item.title}</span>

                {hasChildren && (
                    <span
                        className={`material-symbols-outlined portal-navbar__arrow ${
                            level > 0
                                ? 'portal-navbar__arrow--right'
                                : ''
                        }`}
                    >
                        {level > 0
                            ? 'chevron_right'
                            : 'expand_more'}
                    </span>
                )}
            </a>

            {hasChildren && (
                <div
                    className={`portal-navbar__dropdown ${
                        level > 0
                            ? 'portal-navbar__dropdown--nested'
                            : ''
                    }`}
                >
                    <div className="portal-navbar__dropdown-inner">
                        {item.children.map((child) => (
                            <NavbarItem
                                key={child.id}
                                item={child}
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Navbar({ menuItems = [] }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    const visibleItems = menuItems.slice(0, 7);
    const moreItems = menuItems.slice(7);

    return (
        <header className="portal-navbar">
            <div className="portal-navbar__container">
                {/* FILA PRINCIPAL */}
                <div className="portal-navbar__top">
                    <a href="/" className="portal-navbar__brand">
                        <img
                            src="/images/logo-hu.png"
                            alt="Hospital Universitario"
                        />
                    </a>

                    <nav className="portal-navbar__menu">
                        {visibleItems.map((item) => (
                            <NavbarItem key={item.id} item={item} />
                        ))}

                        {moreItems.length > 0 && (
                            <div
                                className={`portal-navbar__item-wrapper portal-navbar__more-wrapper ${
                                    moreOpen
                                        ? "portal-navbar__more-wrapper--open"
                                        : ""
                                }`}
                            >
                                <button
                                    type="button"
                                    className="portal-navbar__more"
                                    onClick={() =>
                                        setMoreOpen((current) => !current)
                                    }
                                    aria-expanded={moreOpen}
                                >
                                    <span>{moreOpen ? "Menos" : "Más"}</span>

                                    <span
                                        className={`material-symbols-outlined portal-navbar__more-arrow ${
                                            moreOpen
                                                ? "portal-navbar__more-arrow--open"
                                                : ""
                                        }`}
                                    >
                                        expand_more
                                    </span>
                                </button>

                                {/* SEGUNDA FILA */}
                                <div
                                    className={`portal-navbar__more-row ${
                                        moreOpen
                                            ? "portal-navbar__more-row--open"
                                            : ""
                                    }`}
                                >
                                    <nav className="portal-navbar__more-menu">
                                        {moreItems.map((item) => (
                                            <NavbarItem
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* HAMBURGER */}
                    <button
                        type="button"
                        className="portal-navbar__toggle"
                        onClick={() => setMenuOpen((current) => !current)}
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuOpen}
                    >
                        <span className="material-symbols-outlined">
                            {menuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </div>

            {/* MOBILE */}
            <div
                className={`portal-navbar__mobile ${
                    menuOpen ? "portal-navbar__mobile--open" : ""
                }`}
            >
                <nav className="portal-navbar__mobile-menu">
                    {menuItems.map((item) => (
                        <NavbarItem key={item.id} item={item} />
                    ))}
                </nav>
            </div>
        </header>
    );
}