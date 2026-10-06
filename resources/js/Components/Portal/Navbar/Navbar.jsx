import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { getMenuItemLinkProps } from "@/Utils/menuLinks";
import "./Navbar.css";

/* =========================================================
   ITEM DESKTOP
   ========================================================= */

function NavbarItem({ item, level = 0 }) {
    const hasChildren = item.children?.length > 0;

    const [openDirection, setOpenDirection] = useState("center");

    const itemRef = React.useRef(null);

    // Los botones con hijos solo abren el submenú (no navegan).
    const linkProps = hasChildren
        ? { href: "#" }
        : getMenuItemLinkProps(item);

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
                setOpenDirection("edge-left");
            } else if (spaceLeft < dropdownWidth / 2) {
                setOpenDirection("right");
            } else {
                setOpenDirection("center");
            }

            return;
        }

        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;

        if (spaceRight < dropdownWidth && spaceLeft >= dropdownWidth) {
            setOpenDirection("left");
        } else {
            setOpenDirection("right");
        }
    };

    return (
        <div
            ref={itemRef}
            onMouseEnter={handleMouseEnter}
            className={`portal-navbar__item-wrapper ${
                hasChildren ? "portal-navbar__item-wrapper--has-children" : ""
            } ${
                level === 0
                    ? openDirection !== "center"
                        ? `portal-navbar__item-wrapper--dropdown-${openDirection}`
                        : ""
                    : openDirection === "left"
                      ? "portal-navbar__item-wrapper--dropdown-left"
                      : ""
            }`}
        >
            <a {...linkProps} className="portal-navbar__item">
                <span>{item.title}</span>

                {hasChildren && (
                    <span
                        className={`material-symbols-outlined portal-navbar__arrow ${
                            level > 0 ? "portal-navbar__arrow--right" : ""
                        }`}
                    >
                        {level > 0 ? "chevron_right" : "expand_more"}
                    </span>
                )}
            </a>

            {hasChildren && (
                <div
                    className={`portal-navbar__dropdown ${
                        level > 0 ? "portal-navbar__dropdown--nested" : ""
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

/* =========================================================
   ITEM MOBILE (con + / − para abrir hijos)
   ========================================================= */

function MobileNavItem({ item }) {
    const [open, setOpen] = useState(false);

    const children = item.children ?? [];
    const hasChildren = children.length > 0;

    if (!hasChildren) {
        return (
            <a
                {...getMenuItemLinkProps(item)}
                className="portal-navbar__mobile-link"
            >
                <span>{item.title}</span>
            </a>
        );
    }

    return (
        <div className="portal-navbar__mobile-item">
            <button
                type="button"
                className={`portal-navbar__mobile-link ${
                    open ? "is-open" : ""
                }`}
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
            >
                <span>{item.title}</span>

                <span className="material-symbols-outlined portal-navbar__mobile-icon">
                    {open ? "remove" : "add"}
                </span>
            </button>

            {open && (
                <div className="portal-navbar__mobile-children">
                    {children.map((child) => (
                        <MobileNavItem key={child.id} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* =========================================================
   NAVBAR
   ========================================================= */

const MAX_VISIBLE = 7; // máximo de ítems en la fila principal
const MIN_VISIBLE = 3; // por debajo de esto se usa la hamburguesa
const MENU_GAP = 4; // debe coincidir con .portal-navbar__menu { gap }
const BRAND_GAP = 24; // margen entre logo y menú
const SAFETY = 8; // holgura para no quedar justo
const MOBILE_MAX_WIDTH = 768; // en táctil siempre hamburguesa

export default function Navbar({ menuItems = [] }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    const [visibleCount, setVisibleCount] = useState(
        Math.min(menuItems.length, MAX_VISIBLE)
    );
    const [compact, setCompact] = useState(false);

    const topRef = useRef(null);
    const brandRef = useRef(null);
    const measureRef = useRef(null);

    /*
     * Cuántos ítems entran en la fila:
     * - Se miden los ítems reales en un contenedor oculto.
     * - Los que no entran pasan al botón "Más".
     * - La hamburguesa solo aparece si no entran ni MIN_VISIBLE
     *   ítems, o si la pantalla es de celular.
     */
    useLayoutEffect(() => {
        const top = topRef.current;
        const brand = brandRef.current;
        const measure = measureRef.current;

        if (!top || !brand || !measure) {
            return undefined;
        }

        const check = () => {
            const styles = window.getComputedStyle(top);

            const available =
                top.clientWidth -
                parseFloat(styles.paddingLeft) -
                parseFloat(styles.paddingRight) -
                brand.offsetWidth -
                BRAND_GAP;

            const nodes = Array.from(measure.children);
            const moreNode = nodes[nodes.length - 1];
            const itemNodes = nodes.slice(0, -1);

            const widths = itemNodes.map((el) => el.offsetWidth);
            const moreWidth = moreNode ? moreNode.offsetWidth : 0;
            const total = widths.length;

            let fitCount = 0;

            for (let k = Math.min(total, MAX_VISIBLE); k > 0; k--) {
                const itemsWidth =
                    widths.slice(0, k).reduce((sum, w) => sum + w, 0) +
                    MENU_GAP * (k - 1);

                const moreNeeded = k < total ? MENU_GAP + moreWidth : 0;

                if (itemsWidth + moreNeeded + SAFETY <= available) {
                    fitCount = k;
                    break;
                }
            }

            const isMobile =
                window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
                    .matches;

            const minNeeded = Math.min(total, MIN_VISIBLE);

            setVisibleCount(fitCount);
            setCompact(isMobile || fitCount < minNeeded);
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(top);
        observer.observe(brand);
        observer.observe(measure);

        // Los textos cambian de ancho cuando terminan de cargar las fuentes
        document.fonts?.ready.then(check);

        return () => observer.disconnect();
    }, [menuItems]);

    useEffect(() => {
        if (compact) {
            setMoreOpen(false);
        } else {
            setMenuOpen(false);
        }
    }, [compact]);

    const visibleItems = menuItems.slice(0, visibleCount);
    const moreItems = menuItems.slice(visibleCount);

    return (
        <header
            className={`portal-navbar ${
                compact ? "portal-navbar--compact" : ""
            }`}
        >
            {/* MEDICIÓN (oculto): ancho real de cada ítem y del botón Más */}
            <div
                className="portal-navbar__measure"
                aria-hidden="true"
                inert=""
                ref={measureRef}
            >
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className="portal-navbar__item-wrapper"
                    >
                        <span className="portal-navbar__item">
                            <span>{item.title}</span>

                            {item.children?.length > 0 && (
                                <span className="material-symbols-outlined portal-navbar__arrow">
                                    expand_more
                                </span>
                            )}
                        </span>
                    </div>
                ))}

                <div className="portal-navbar__item-wrapper">
                    <span className="portal-navbar__more">
                        <span>Menos</span>

                        <span className="material-symbols-outlined portal-navbar__more-arrow">
                            expand_more
                        </span>
                    </span>
                </div>
            </div>

            <div
                className={`portal-navbar__container ${
                    moreOpen ? "portal-navbar__container--more-open" : ""
                }`}
            >
                {/* FILA PRINCIPAL */}
                <div className="portal-navbar__top" ref={topRef}>
                    <a
                        href="/"
                        className="portal-navbar__brand"
                        ref={brandRef}
                    >
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

                {/* MOBILE */}
                <div
                    className={`portal-navbar__mobile ${
                        menuOpen ? "portal-navbar__mobile--open" : ""
                    }`}
                >
                    <nav className="portal-navbar__mobile-menu">
                        {menuItems.map((item) => (
                            <MobileNavItem key={item.id} item={item} />
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}