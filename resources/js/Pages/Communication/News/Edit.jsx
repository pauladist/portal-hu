import React, { useCallback, useState } from "react";

import { Head, Link, useForm } from "@inertiajs/react";

import PanelLayout from "@/Layouts/PanelLayout";

import RichTextEditor from "@/Components/Communication/RichTextEditor";
import CategorySelector from "@/Components/Communication/CategorySelector";
import TagSelector from "@/Components/Communication/TagSelector";

import "../css/create.css";


export default function Edit({
    news,
    publishedAtInput = "",
    categories = [],
    tags = [],
}) {
    const { data, setData, post, transform, processing, errors } = useForm({
        title: news.title ?? "",
        subtitle: news.subtitle ?? "",
        content: news.content ?? "",
        status: news.status,
        published_at: publishedAtInput,
        categories: (news.categories ?? []).map((category) => category.id),
        tags: (news.tags ?? []).map((tag) => tag.id),
        cover: null,
        editor_media: [],
    });


    /*
    |--------------------------------------------------------------------------
    | Estados
    |--------------------------------------------------------------------------
    */

    const currentCover =
        news.media?.find((media) => media.is_featured && media.type === "image") ??
        null;

    const [coverPreview, setCoverPreview] = useState(null);

    const [showSchedule, setShowSchedule] = useState(
        news.status === "scheduled"
    );

    const [showStatusMenu, setShowStatusMenu] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Archivos del editor
    |--------------------------------------------------------------------------
    */

    const handleEditorMediaChange = useCallback(
        (mediaFiles) => {
            setData("editor_media", mediaFiles);
        },
        [setData]
    );


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

        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }

        setData("cover", file);
        setCoverPreview(URL.createObjectURL(file));

        event.target.value = "";
    };


    const removeNewCover = () => {
        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }

        setCoverPreview(null);
        setData("cover", null);
    };


    /*
    |--------------------------------------------------------------------------
    | Enviar
    |--------------------------------------------------------------------------
    |
    | Los archivos requieren multipart, y Laravel no lee multipart en PUT,
    | por eso se envía por POST con _method=put.
    |
    */

    const submit = (status) => {
        setShowStatusMenu(false);

        transform((formData) => {
            const payload = {
                ...formData,
                status,
                published_at:
                    status === "scheduled" ? formData.published_at : "",
                _method: "put",
            };

            if (!payload.cover) {
                delete payload.cover;
            }

            return payload;
        });

        post(route("news.update", news.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };


    const handleSubmit = (event) => {
        event.preventDefault();

        submit(showSchedule ? "scheduled" : "published");
    };


    const handleSchedule = () => {
        if (showSchedule) {
            setData("published_at", "");
        }

        setShowSchedule(!showSchedule);
        setShowStatusMenu(false);
    };


    const primaryLabel = processing
        ? "Guardando..."
        : showSchedule
            ? "Programar"
            : news.status === "published"
                ? "Actualizar"
                : "Publicar";


    return (
        <PanelLayout>

            <Head title="Editar noticia" />


            <div className="news-create">

                {/* HEADER */}

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


                        <h1>
                            Editar noticia
                        </h1>


                        <p>
                            Modificá los datos de la noticia y guardá los cambios.
                        </p>

                    </div>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="news-create-form"
                >

                    {/* INFORMACIÓN PRINCIPAL */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Información de la noticia
                            </h2>

                            <p>
                                Editá el contenido principal de la noticia.
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
                                    setData("title", event.target.value)
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
                                    setData("subtitle", event.target.value)
                                }
                                placeholder="Ingresá un subtítulo"
                            />

                            {errors.subtitle && (
                                <span className="news-form-error">
                                    {errors.subtitle}
                                </span>
                            )}

                        </div>


                        {/* PORTADA */}

                        <div className="news-form-field">

                            <label>
                                Imagen de portada
                            </label>

                            <p className="news-field-description">
                                Si no elegís una nueva, se mantiene la actual.
                            </p>


                            {coverPreview || currentCover ? (

                                <div className="news-cover-preview">

                                    <img
                                        src={
                                            coverPreview ??
                                            `/storage/${currentCover.path}`
                                        }
                                        alt="Portada de la noticia"
                                    />

                                    <div className="news-cover-preview-actions">

                                        <span>
                                            {coverPreview
                                                ? "Nueva portada"
                                                : "Portada actual"}
                                        </span>

                                        {coverPreview ? (

                                            <button
                                                type="button"
                                                onClick={removeNewCover}
                                                className="news-preview-remove"
                                                aria-label="Descartar nueva portada"
                                            >

                                                <span className="material-symbols-outlined">
                                                    close
                                                </span>

                                            </button>

                                        ) : (

                                            <label
                                                htmlFor="cover"
                                                className="news-preview-remove"
                                                style={{ cursor: "pointer" }}
                                                aria-label="Cambiar portada"
                                                title="Cambiar portada"
                                            >

                                                <span className="material-symbols-outlined">
                                                    edit
                                                </span>

                                            </label>

                                        )}

                                    </div>

                                </div>

                            ) : (

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

                            )}


                            <input
                                id="cover"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleCoverChange}
                                className="news-file-input"
                            />


                            {errors.cover && (
                                <span className="news-form-error">
                                    {errors.cover}
                                </span>
                            )}

                        </div>


                        {/* CONTENIDO */}

                        <div className="news-form-field">

                            <label htmlFor="content">
                                Contenido
                            </label>

                            <RichTextEditor
                                value={data.content}
                                onChange={(value) =>
                                    setData("content", value)
                                }
                                onMediaChange={handleEditorMediaChange}
                            />

                            {errors.content && (
                                <span className="news-form-error">
                                    {errors.content}
                                </span>
                            )}

                            {Object.keys(errors)
                                .filter((key) => key.startsWith("editor_media"))
                                .map((key) => (
                                    <span
                                        key={key}
                                        className="news-form-error"
                                    >
                                        {errors[key]}
                                    </span>
                                ))}

                        </div>

                    </section>


                    {/* CATEGORÍAS */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Categorías
                            </h2>

                            <p>
                                Seleccioná las categorías correspondientes.
                            </p>

                        </div>

                        <CategorySelector
                            categories={categories}
                            selected={data.categories}
                            onChange={(selectedCategories) =>
                                setData("categories", selectedCategories)
                            }
                            createUrl={route("news.categories.quickStore")}
                            error={errors.categories}
                        />

                    </section>


                    {/* TAGS */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Tags
                            </h2>

                            <p>
                                Seleccioná los tags relacionados con la noticia.
                            </p>

                        </div>

                        <TagSelector
                            tags={tags}
                            selected={data.tags}
                            onChange={(selectedTags) =>
                                setData("tags", selectedTags)
                            }
                            createUrl={route("news.tags.quickStore")}
                            error={errors.tags}
                        />

                    </section>


                    {/* ACCIONES DE PUBLICACIÓN */}

                    <div className="news-publication-actions">

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
                                            event.target.value
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


                            {/* GUARDAR */}

                            <div className="news-publish-group">

                                <button
                                    type="submit"
                                    className="news-publish-button"
                                    disabled={processing}
                                >
                                    {primaryLabel}
                                </button>


                                <button
                                    type="button"
                                    className="news-publish-dropdown"
                                    onClick={() =>
                                        setShowStatusMenu(!showStatusMenu)
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
                                            onClick={() => submit("draft")}
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