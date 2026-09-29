import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '@/Layouts/PanelLayout';

import '../css/create.css';

export default function Create({
    categories = [],
    tags = [],
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        title: '',
        subtitle: '',
        content: '',
        status: 'draft',
        published_at: '',
        categories: [],
        tags: [],
        media: [],
    });

    const [mediaPreviews, setMediaPreviews] = useState([]);


    /*
    |--------------------------------------------------------------------------
    | Categorías
    |--------------------------------------------------------------------------
    */

    const toggleCategory = (categoryId) => {
        setData(
            'categories',
            data.categories.includes(categoryId)
                ? data.categories.filter(id => id !== categoryId)
                : [...data.categories, categoryId]
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Tags
    |--------------------------------------------------------------------------
    */

    const toggleTag = (tagId) => {
        setData(
            'tags',
            data.tags.includes(tagId)
                ? data.tags.filter(id => id !== tagId)
                : [...data.tags, tagId]
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Imagen
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        const media = files.map((file, index) => ({
            type: 'image',
            file: file,
            title: '',
            is_featured: index === 0,
            order: index,
        }));

        setData('media', media);

        const previews = media.map(mediaItem => ({
            file: mediaItem.file,
            url: URL.createObjectURL(mediaItem.file),
        }));

        setMediaPreviews(previews);
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle || '');
        formData.append('content', data.content);
        formData.append('status', data.status);
        formData.append('published_at', data.published_at || '');

        data.categories.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId);
        });

        data.tags.forEach((tagId, index) => {
            formData.append(`tags[${index}]`, tagId);
        });

        data.media.forEach((media, index) => {
            formData.append(`media[${index}][type]`, media.type);
            formData.append(`media[${index}][title]`, media.title || '');
            formData.append(
                `media[${index}][is_featured]`,
                media.is_featured ? '1' : '0'
            );
            formData.append(`media[${index}][order]`, media.order ?? index);

            if (media.file) {
                formData.append(
                    `media[${index}][file]`,
                    media.file
                );
            }
        });

        console.log('FORM DATA PREPARADO');

        post(route('news.store'), {
            data: formData,
            forceFormData: true,

            onError: (errors) => {
                console.log('ERRORES DE LARAVEL:', errors);
            },

            onSuccess: () => {
                console.log('NOTICIA GUARDADA CORRECTAMENTE');
            },
        });
    };


    return (
        <PanelLayout>

            <Head title="Crear noticia" />

            <div className="news-create">

                {/* HEADER */}

                <div className="news-create-header">

                    <div>

                        <Link
                            href={route('news.dashboard')}
                            className="news-back"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>

                            Volver a noticias
                        </Link>

                        <h1>
                            Crear noticia
                        </h1>

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

                            <h2>
                                Información de la noticia
                            </h2>

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
                                onChange={event =>
                                    setData('title', event.target.value)
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
                                onChange={event =>
                                    setData('subtitle', event.target.value)
                                }
                                placeholder="Ingresá un subtítulo"
                            />

                            {errors.subtitle && (
                                <span className="news-form-error">
                                    {errors.subtitle}
                                </span>
                            )}

                        </div>


                        {/* CONTENIDO */}

                        <div className="news-form-field">

                            <label htmlFor="content">
                                Contenido
                            </label>

                            <textarea
                                id="content"
                                rows="12"
                                value={data.content}
                                onChange={event =>
                                    setData('content', event.target.value)
                                }
                                placeholder="Escribí el contenido de la noticia..."
                            />

                            {errors.content && (
                                <span className="news-form-error">
                                    {errors.content}
                                </span>
                            )}

                        </div>

                    </section>


                    {/* =====================================================
                        PUBLICACIÓN
                    ====================================================== */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Publicación
                            </h2>

                            <p>
                                Definí cuándo y cómo se publicará la noticia.
                            </p>

                        </div>


                        <div className="news-form-grid">

                            {/* ESTADO */}

                            <div className="news-form-field">

                                <label htmlFor="status">
                                    Estado
                                </label>

                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={event =>
                                        setData('status', event.target.value)
                                    }
                                >
                                    <option value="draft">
                                        Borrador
                                    </option>

                                    <option value="scheduled">
                                        Programada
                                    </option>

                                    <option value="published">
                                        Publicada
                                    </option>
                                </select>

                                {errors.status && (
                                    <span className="news-form-error">
                                        {errors.status}
                                    </span>
                                )}

                            </div>


                            {/* FECHA */}

                            <div className="news-form-field">

                                <label htmlFor="published_at">
                                    Fecha de publicación
                                </label>

                                <input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={event =>
                                        setData(
                                            'published_at',
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

                            {categories.map(category => (

                                <button
                                    key={category.id}
                                    type="button"
                                    className={
                                        data.categories.includes(category.id)
                                            ? 'news-chip selected'
                                            : 'news-chip'
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

                            {tags.map(tag => (

                                <button
                                    key={tag.id}
                                    type="button"
                                    className={
                                        data.tags.includes(tag.id)
                                            ? 'news-chip selected'
                                            : 'news-chip'
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
                        IMAGEN
                    ====================================================== */}

                    <section className="news-form-section">

                        <div className="news-section-heading">

                            <h2>
                                Imagen
                            </h2>

                            <p>
                                Agregá una imagen para acompañar la noticia.
                            </p>

                        </div>


                        <label
                            htmlFor="media"
                            className="news-upload"
                        >

                            <span className="material-symbols-outlined">
                                cloud_upload
                            </span>

                            <strong>
                                Seleccionar imagen
                            </strong>

                            <span>
                                JPG, PNG o WEBP
                            </span>

                        </label>

                        <input
                            id="media"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="news-file-input"
                        />


                        {mediaPreviews.length > 0 && (

                            <div className="news-media-preview">

                                {mediaPreviews.map((media, index) => (

                                    <div
                                        key={index}
                                        className="news-preview-item"
                                    >

                                        <img
                                            src={media.url}
                                            alt="Vista previa"
                                        />

                                    </div>

                                ))}

                            </div>

                        )}

                        {errors.media && (
                            <span className="news-form-error">
                                {errors.media}
                            </span>
                        )}

                    </section>


                    {/* =====================================================
                        ACCIONES
                    ====================================================== */}

                    <div className="news-form-actions">

                        <Link
                            href={route('news.dashboard')}
                            className="news-cancel-button"
                        >
                            Cancelar
                        </Link>


                        <button
                            type="submit"
                            className="news-save-button"
                            disabled={processing}
                        >

                            <span className="material-symbols-outlined">
                                save
                            </span>

                            {processing
                                ? 'Guardando...'
                                : 'Guardar noticia'
                            }

                        </button>

                    </div>

                </form>

            </div>

        </PanelLayout>
    );
}