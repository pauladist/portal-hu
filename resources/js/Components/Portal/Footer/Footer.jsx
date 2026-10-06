import React from 'react';
import { getMenuItemHref } from '@/Utils/menuLinks';
import './footer.css';

export default function Footer({ quickLinks = [] }) {
    const year = new Date().getFullYear();

    return (
        <footer className="portal-footer">

            <div className="portal-footer__container">

                <div className="portal-footer__brand">
                    <a href="/" aria-label="Ir al inicio">
                        <img
                            src="/images/logo-hu-blanco.png"
                            alt="Hospital Universitario"
                            className="portal-footer__logo"
                        />
                    </a>

                    <p className="portal-footer__text">
                        Un espacio de comunicación, información y
                        herramientas para nuestra comunidad hospitalaria.
                    </p>
                </div>

                <nav
                    className="portal-footer__column"
                    aria-label="Portal"
                >
                    <h2 className="portal-footer__heading">Portal</h2>

                    <ul className="portal-footer__list">
                        <li>
                            <a href="/">Inicio</a>
                        </li>

                        <li>
                            <a href="/noticias">Historial de noticias</a>
                        </li>
                    </ul>
                </nav>

                {quickLinks.length > 0 && (
                    <nav
                        className="portal-footer__column"
                        aria-label="Accesos rápidos"
                    >
                        <h2 className="portal-footer__heading">
                            Accesos rápidos
                        </h2>

                        <ul className="portal-footer__list">
                            {quickLinks.map((item) => (
                                <li key={item.id}>
                                    <a href={getMenuItemHref(item)}>
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

            </div>

            <div className="portal-footer__bottom">
                © {year} Hospital Universitario. Todos los derechos
                reservados.
            </div>

        </footer>
    );
}