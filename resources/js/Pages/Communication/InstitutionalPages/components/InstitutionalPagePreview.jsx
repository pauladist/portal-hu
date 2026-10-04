import React from "react";

import "./../css/preview.css";


export default function InstitutionalPagePreview({
    page,
    onClose,
    onEdit,
}) {

    if (!page) {
        return null;
    }


    return (

        <div
            className="institutional-preview-overlay"
            onClick={onClose}
        >

            <div
                className="institutional-preview-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header className="institutional-preview-header">

                    <div className="institutional-preview-heading">

                        <span className="institutional-preview-label">
                            Vista previa
                        </span>

                        <h2>
                            {page.title}
                        </h2>

                    </div>


                    <button
                        type="button"
                        className="institutional-preview-close"
                        onClick={onClose}
                        aria-label="Cerrar vista previa"
                    >

                        <span className="material-symbols-outlined">
                            close
                        </span>

                    </button>

                </header>


                {/* =====================================================
                    CONTENIDO
                ====================================================== */}

                <div className="institutional-preview-body">

                    {page.subtitle && (

                        <p className="institutional-preview-subtitle">
                            {page.subtitle}
                        </p>

                    )}


                    {page.content ? (

                        <div
                            className="institutional-preview-content"
                            dangerouslySetInnerHTML={{
                                __html: page.content,
                            }}
                        />

                    ) : (

                        <div className="institutional-preview-empty">

                            <span className="material-symbols-outlined">
                                article
                            </span>

                            <p>
                                Esta página todavía no tiene
                                contenido.
                            </p>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    FOOTER
                ====================================================== */}

                <footer className="institutional-preview-footer">

                    <button
                        type="button"
                        className="institutional-preview-edit"
                        onClick={() =>
                            onEdit(page)
                        }
                    >

                        <span className="material-symbols-outlined">
                            edit
                        </span>

                        Editar

                    </button>

                </footer>

            </div>

        </div>
    );
}