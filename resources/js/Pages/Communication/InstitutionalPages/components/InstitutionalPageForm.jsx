import React, { useCallback } from "react";

import { Head, Link, router, useForm } from "@inertiajs/react";

import RichTextEditor from "@/Components/Communication/RichTextEditor";

import "../css/form.css";

export default function InstitutionalPageForm({
    mode = "create",
    page = null,
}) {
    const isEdit = mode === "edit";

    /*
    |--------------------------------------------------------------------------
    | Formulario
    |--------------------------------------------------------------------------
    */

    const { data, setData, processing, errors } = useForm({
        title: page?.title ?? "",

        subtitle: page?.subtitle ?? "",

        content: page?.content ?? "",

        status: page?.status ?? "draft",

        published_at: page?.published_at ?? "",

        editor_media: [],
    });

    /*
    |--------------------------------------------------------------------------
    | Media del editor
    |--------------------------------------------------------------------------
    */

    const handleEditorMediaChange = useCallback(
        (mediaFiles) => {
            setData("editor_media", mediaFiles);
        },
        [setData],
    );

    /*
    |--------------------------------------------------------------------------
    | Enviar formulario
    |--------------------------------------------------------------------------
    */

    const submit = (status) => {
        const formData = new FormData();

        /*
        |----------------------------------------------------------------------
        | Método
        |----------------------------------------------------------------------
        */

        if (isEdit) {
            formData.append("_method", "PUT");
        }

        /*
        |----------------------------------------------------------------------
        | Datos principales
        |----------------------------------------------------------------------
        */

        formData.append("title", data.title);

        formData.append("subtitle", data.subtitle || "");

        formData.append("content", data.content || "");

        formData.append("status", status);

        formData.append(
            "published_at",
            status === "published" ? data.published_at || "" : "",
        );

        /*
        |----------------------------------------------------------------------
        | Media
        |----------------------------------------------------------------------
        */

        data.editor_media.forEach((media, index) => {
            if (media.id !== undefined && media.id !== null) {
                formData.append(`editor_media[${index}][id]`, media.id);
            }

            formData.append(`editor_media[${index}][type]`, media.type || "");

            if (media.file) {
                formData.append(`editor_media[${index}][file]`, media.file);
            }
        });

        /*
        |----------------------------------------------------------------------
        | Crear
        |----------------------------------------------------------------------
        */

        if (!isEdit) {
            router.post(route("institutional-pages.store"), formData, {
                forceFormData: true,
                preserveScroll: true,
            });

            return;
        }

        /*
        |----------------------------------------------------------------------
        | Editar
        |----------------------------------------------------------------------
        */

        router.post(route("institutional-pages.update", page.id), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Submit normal
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event) => {
        event.preventDefault();

        submit(data.status || "draft");
    };

    return (
        <div className="institutional-form-page">
            {/* =============================================================
                HEADER
            ============================================================== */}

            <header className="institutional-form-header">
                <div>
                    <Link
                        href={route("institutional-pages.index")}
                        className="institutional-form-back"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                        Volver a contenido institucional
                    </Link>

                    <h1>
                        {isEdit
                            ? "Editar página institucional"
                            : "Nueva página institucional"}
                    </h1>

                    <p>
                        {isEdit
                            ? "Modificá el contenido de la página institucional."
                            : "Creá una nueva página informativa para el portal."}
                    </p>
                </div>
            </header>

            {/* =============================================================
                FORMULARIO
            ============================================================== */}

            <form className="institutional-form" onSubmit={handleSubmit}>
                <section className="institutional-form-section">
                    <div className="institutional-form-section__heading">
                        <h2>Información de la página</h2>

                        <p>
                            Ingresá el título y el contenido que tendrá la
                            página.
                        </p>
                    </div>

                    {/* =====================================================
                        TÍTULO
                    ====================================================== */}

                    <div className="institutional-form-field">
                        <label htmlFor="institutional-title">Título</label>

                        <input
                            id="institutional-title"
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData("title", event.target.value)
                            }
                            placeholder="Ingresá el título de la página"
                            autoComplete="off"
                        />

                        {errors.title && (
                            <span className="institutional-form-error">
                                {errors.title}
                            </span>
                        )}
                    </div>

                    {/* =====================================================
                        EDITOR
                    ====================================================== */}

                    <div className="institutional-form-field">
                        <label>Contenido</label>

                        <p className="institutional-form-description">
                            Escribí el contenido de la página. Podés utilizar
                            formato, imágenes y archivos PDF desde el editor.
                        </p>

                        <RichTextEditor
                            value={data.content}
                            onChange={(value) => setData("content", value)}
                            onMediaChange={handleEditorMediaChange}
                        />

                        {errors.content && (
                            <span className="institutional-form-error">
                                {errors.content}
                            </span>
                        )}

                        {errors.editor_media && (
                            <span className="institutional-form-error">
                                {errors.editor_media}
                            </span>
                        )}
                    </div>
                </section>

                {/* =========================================================
                    ACCIONES
                ========================================================== */}

                <div className="institutional-form-actions">
                    <Link
                        href={route("institutional-pages.index")}
                        className="institutional-form-button institutional-form-button--cancel"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="button"
                        className="institutional-form-button institutional-form-button--draft"
                        disabled={processing}
                        onClick={() => submit("draft")}
                    >
                        {processing ? "Guardando..." : "Guardar borrador"}
                    </button>

                    <button
                        type="button"
                        className="institutional-form-button institutional-form-button--publish"
                        disabled={processing}
                        onClick={() => submit("published")}
                    >
                        {processing ? "Guardando..." : "Publicar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
