import React from 'react';
import './hero.css';

export default function Hero() {
    return (
        <section className="portal-hero">
            <div className="portal-hero__overlay"></div>

            <div className="portal-hero__content">
                <span className="portal-hero__line"></span>

                <h1>
                    ¡Bienvenido al
                    <br />
                    Portal HU!
                </h1>

                <p>
                    Un espacio de comunicación, información y herramientas
                    para nuestra comunidad hospitalaria.
                </p>
            </div>
        </section>
    );
}