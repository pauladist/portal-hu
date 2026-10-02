import React, { useCallback, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import PanelLayout from "@/Layouts/PanelLayout";
import RichTextEditor from "@/Components/Communication/RichTextEditor";
import "../css/create.css";

export default function Create({ categories = [], tags = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        subtitle: "",
        content: "",
        status: "draft",
        published_at: "",
        categories: [],
        tags: [],
        cover: null,
        editor_media: [],
    });

    const handleEditorMediaChange = useCallback(
        (mediaFiles) => {
            setData("editor_media", mediaFiles);
        },
        [setData]
    );
    const [coverPreview, setCoverPreview] = useState(null);

    const [showSchedule, setShowSchedule] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Categorías
    |--------------------------------------------------------------------------
    */

    const toggleCategory = (categoryId) => {
        setData(
            "categories",
            data.categories.includes(categoryId)
                ? data.categories.filter((id) => id !== categoryId)
                : [...data.categories, categoryId],
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Tags
    |--------------------------------------------------------------------------
    */

    const toggleTag = (tagId) => {
        setData(
            "tags",
            data.tags.includes(tagId)
                ? data.tags.filter((id) => id !== tagId)
                : [...data.tags, tagId],
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Portada
    |--------------------------------------------------------------------------
    */

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // Liberar preview anterior
        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }

        const previewUrl = URL.createObjectURL(file);

        setData("cover", file);
        setCoverPreview(previewUrl);

        // Permite volver a seleccionar el mismo archivo
        event.target.value = "";
    };

    const removeCover = () => {
        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }

        setCoverPreview(null);
        setData("cover", null);
    };

    /*
    |--------------------------------------------------------------------------
    | Publicación
    |--------------------------------------------------------------------------
    */

    const submitWithStatus = (status) => {
        setData("status", status);

        setTimeout(() => {
            document
                .querySelector(".news-create-form")
                ?.requestSubmit();
        }, 0);
    };

    const handlePublish = () => {
        setData("published_at", "");
        setShowSchedule(false);
        setShowStatusMenu(false);

        submitWithStatus("published");
    };

    const handleDraft = () => {
        setData("published_at", "");
        setShowSchedule(false);
        setShowStatusMenu(false);

        submitWithStatus("draft");
    };

    const handleSchedule = () => {
        if (showSchedule) {
            // Volver a publicación normal
            setData("status", "published");
            setData("published_at", "");
            setShowSchedule(false);
        } else {
            // Activar programación
            setData("status", "scheduled");
            setShowSchedule(true);
        }

        setShowStatusMenu(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Enviar formulario
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("subtitle", data.subtitle || "");
        formData.append("content", data.content);
        formData.append("status", data.status);
        formData.append("published_at", data.published_at || "");

        /*
        |----------------------------------------------------------------------
        | Portada
        |----------------------------------------------------------------------
        */

        if (data.cover) {
            formData.append("cover", data.cover);
        }

        /*
        |----------------------------------------------------------------------
        | Categorías
        |----------------------------------------------------------------------
        */

        data.categories.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId);
        });

        /*
        |----------------------------------------------------------------------
        | Tags
        |----------------------------------------------------------------------
        */

        data.tags.forEach((tagId, index) => {
            formData.append(`tags[${index}]`, tagId);
        });

        /*
        |----------------------------------------------------------------------
        | Archivos insertados desde el editor
        |
        | Cada elemento tiene:
        | id
        | file
        | type
        | name
        | url
        |----------------------------------------------------------------------
        */

        data.editor_media.forEach((media, index) => {
            formData.append(
                `editor_media[${index}][id]`,
                media.id,
            );

            formData.append(
                `editor_media[${index}][type]`,
                media.type || "",
            );

            formData.append(
                `editor_media[${index}][file]`,
                media.file,
            );
        });

        console.log("FORM DATA PREPARADO");

        post(route("news.store"), {
            data: formData,
            forceFormData: true,

            onError: (errors) => {
                console.log("ERRORES DE LARAVEL:", errors);
            },

            onSuccess: () => {
                console.log("NOTICIA GUARDADA CORRECTAMENTE");
            },
        });
    };

    return (
        <PanelLayout>
            <Head title="Crear noticia" />

            <div className="news-create">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="news-create-header">
                    <div>
                        <Link
                            href={route("news.dashboard")}
                            className="news-back"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>

                            Volver a noticias
                        </Link>

                        <h1>Crear noticia</h1>

                        <p>
                            Completá los datos para publicar una nueva noticia.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="news-create-form"
                >

                    {/* =====================================================
                        INFORMACIÓN PRINCIPAL
                    ====================================================== */}

                    <section className="news-form-section">

                        <div className="news-section-heading">
                            <h2>Información de la noticia</h2>

                            <p>
                                Ingresá el contenido principal de la noticia.
                            </p>
                        </div>

                        {/* TÍTULO */}

                        <div className="news-form-field">
                            <label htmlFor="title">
                                Título
                            </label>

                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(event) =>
                                    setData(
                                        "title",
                                        event.target.value,
                                    )
                                }
                                placeholder="Ingresá el título de la noticia"
                            />

                            {errors.title && (
                                <span className="news-form-error">
                                    {errors.title}
                                </span>
                            )}
                        </div>

                        {/* SUBTÍTULO */}

                        <div className="news-form-field">
                            <label htmlFor="subtitle">
                                Subtítulo
                            </label>

                            <input
                                id="subtitle"
                                type="text"
                                value={data.subtitle}
                                onChange={(event) =>
                                    setData(
                                        "subtitle",
                                        event.target.value,
                                    )
                                }
                                placeholder="Ingresá un subtítulo"
                            />

                            {errors.subtitle && (
                                <span className="news-form-error">
                                    {errors.subtitle}
                                </span>
                            )}
                        </div>

                        {/* =================================================
                            PORTADA
                        ================================================== */}

                        <div className="news-form-field">

                            <label>
                                Imagen de portada
                            </label>

                            <p className="news-field-description">
                                Esta imagen se utilizará como imagen principal
                                de la noticia.
                            </p>

                            {!coverPreview ? (
                                <>
                                    <label
                                        htmlFor="cover"
                                        className="news-upload"
                                    >
                                        <span className="material-symbols-outlined">
                                            cloud_upload
                                        </span>

                                        <strong>
                                            Seleccionar imagen de portada
                                        </strong>

                                        <span>
                                            JPG, PNG o WEBP
                                        </span>
                                    </label>

                                    <input
                                        id="cover"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleCoverChange}
                                        className="news-file-input"
                                    />
                                </>
                            ) : (
                                <div className="news-cover-preview">

                                    <img
                                        src={coverPreview}
                                        alt="Vista previa de portada"
                                    />

                                    <div className="news-cover-preview-actions">

                                        <span>
                                            Imagen de portada
                                        </span>

                                        <button
                                            type="button"
                                            onClick={removeCover}
                                            className="news-preview-remove"
                                            aria-label="Eliminar portada"
                                        >
                                            <span className="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>

                                    </div>
                                </div>
                            )}

                            {errors.cover && (
                                <span className="news-form-error">
                                    {errors.cover}
                                </span>
                            )}

                        </div>

                        {/* =================================================
                            CONTENIDO
                        ================================================== */}

                        <div className="news-form-field">

                            <label htmlFor="content">
                                Contenido
                            </label>

                            <RichTextEditor
                                value={data.content}
                                onChange={(value) => setData("content", value)}
                                onMediaChange={handleEditorMediaChange}
                            />

                            {errors.content && (
                                <span className="news-form-error">
                                    {errors.content}
                                </span>
                            )}

                            {errors.editor_media && (
                                <span className="news-form-error">
                                    {errors.editor_media}
                                </span>
                            )}

                        </div>

                    </section>

                    {/* =====================================================
                        CATEGORÍAS
                    ====================================================== */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Categorías
                            </h2>

                            <p>
                                Seleccioná las categorías correspondientes.
                            </p>

                        </div>

                        <div className="news-chip-list">

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={
                                        data.categories.includes(
                                            category.id,
                                        )
                                            ? "news-chip selected"
                                            : "news-chip"
                                    }
                                    onClick={() =>
                                        toggleCategory(category.id)
                                    }
                                >
                                    {category.title}
                                </button>
                            ))}

                        </div>

                        {errors.categories && (
                            <span className="news-form-error">
                                {errors.categories}
                            </span>
                        )}

                    </section>

                    {/* =====================================================
                        TAGS
                    ====================================================== */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Tags
                            </h2>

                            <p>
                                Seleccioná los tags relacionados con la noticia.
                            </p>

                        </div>

                        <div className="news-chip-list">

                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={
                                        data.tags.includes(tag.id)
                                            ? "news-chip selected"
                                            : "news-chip"
                                    }
                                    onClick={() =>
                                        toggleTag(tag.id)
                                    }
                                >
                                    {tag.title}
                                </button>
                            ))}

                        </div>

                        {errors.tags && (
                            <span className="news-form-error">
                                {errors.tags}
                            </span>
                        )}

                    </section>

                    {/* =====================================================
                        ACCIONES DE PUBLICACIÓN
                    ====================================================== */}

                    <div className="news-publication-actions">

                        {/* PROGRAMACIÓN */}

                        {showSchedule && (
                            <div className="news-schedule-field">

                                <label htmlFor="published_at">
                                    Fecha y hora de publicación
                                </label>

                                <input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(event) =>
                                        setData(
                                            "published_at",
                                            event.target.value,
                                        )
                                    }
                                />

                                {errors.published_at && (
                                    <span className="news-form-error">
                                        {errors.published_at}
                                    </span>
                                )}

                            </div>
                        )}

                        <div className="news-publication-buttons">

                            {/* CANCELAR */}

                            <Link
                                href={route("news.dashboard")}
                                className="news-cancel-button"
                            >
                                Cancelar
                            </Link>

                            {/* PROGRAMAR */}

                            <button
                                type="button"
                                className={`news-schedule-button ${
                                    showSchedule ? "active" : ""
                                }`}
                                onClick={handleSchedule}
                                title="Programar publicación"
                            >
                                <span className="material-symbols-outlined">
                                    schedule
                                </span>
                            </button>

                            {/* PUBLICAR */}

                            <div className="news-publish-group">

                                <button
                                    type="button"
                                    className="news-publish-button"
                                    disabled={processing}
                                    onClick={
                                        showSchedule
                                            ? () => {
                                                  setData(
                                                      "status",
                                                      "scheduled",
                                                  );

                                                  setTimeout(() => {
                                                      document
                                                          .querySelector(
                                                              ".news-create-form",
                                                          )
                                                          ?.requestSubmit();
                                                  }, 0);
                                              }
                                            : handlePublish
                                    }
                                >
                                    {processing
                                        ? "Guardando..."
                                        : showSchedule
                                          ? "Programar"
                                          : "Publicar"}
                                </button>

                                <button
                                    type="button"
                                    className="news-publish-dropdown"
                                    onClick={() =>
                                        setShowStatusMenu(
                                            !showStatusMenu,
                                        )
                                    }
                                    aria-label="Más opciones"
                                >
                                    <span className="material-symbols-outlined">
                                        expand_more
                                    </span>
                                </button>

                                {showStatusMenu && (
                                    <div className="news-status-menu">

                                        <button
                                            type="button"
                                            onClick={handleDraft}
                                            disabled={processing}
                                        >
                                            <span className="material-symbols-outlined">
                                                draft
                                            </span>

                                            Guardar como borrador
                                        </button>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </form>

            </div>
        </PanelLayout>
    );
}