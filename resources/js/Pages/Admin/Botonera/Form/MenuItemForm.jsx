import React from "react";
import { router, useForm } from "@inertiajs/react";

import "./MenuItemForm.css";

export default function MenuItemForm({
    parentItem = null,
    menuItem = null,
    mode = "create",
    onCancel = null,
    pages = [],
}) {
    const isEditing = mode === "edit";

    const form = useForm({
        parent_id: menuItem?.parent_id ?? parentItem?.id ?? null,
        title: menuItem?.title ?? "",
        destination_type: menuItem?.destination_type ?? "url",
        url: menuItem?.url ?? "",
        page_id: menuItem?.page_id ?? "",
        file: null,

        // Los necesita actualmente el backend.
        order: menuItem?.order ?? 0,
        is_active: menuItem?.is_active ?? true,
        is_quick_link: menuItem?.is_quick_link ?? false,
        quick_link_order: menuItem?.quick_link_order ?? null,
    });

    const handleDestinationChange = (value) => {
        form.setData("destination_type", value);

        if (value === "url") {
            form.setData("file", null);
            form.setData("page_id", "");
        }

        if (value === "pdf") {
            form.setData("url", "");
            form.setData("page_id", "");
        }

        if (value === "page") {
            form.setData("url", "");
            form.setData("file", null);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isEditing) {
            form.transform((data) => ({
                ...data,
                _method: "PUT",
            }));

            form.post(`/admin/menu-items/${menuItem.id}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (onCancel) {
                        onCancel();
                    }
                },
            });

            return;
        }

        form.post("/admin/menu-items", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (onCancel) {
                    onCancel();
                }
            },
        });
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        router.visit("/admin/botonera");
    };

    return (
        <form className="menu-item-form" onSubmit={handleSubmit}>
            {/* HEADER */}

            <div className="menu-item-form__header">
                <div>
                    <span className="menu-item-form__eyebrow">
                        {isEditing ? "Editar" : "Nuevo botón"}
                    </span>

                    <h1>
                        {isEditing
                            ? "Editar botón"
                            : parentItem
                              ? "Agregar subbotón"
                              : "Crear botón principal"}
                    </h1>

                    <p>
                        {isEditing
                            ? "Modificá la información del botón."
                            : parentItem
                              ? `Se agregará como subbotón de ${parentItem.title}.`
                              : "Creá un nuevo botón principal para la botonera."}
                    </p>
                </div>
            </div>

            {/* UBICACIÓN */}

            <div className="menu-item-form__location">
                <span>Ubicación</span>

                <div className="menu-item-form__breadcrumb">
                    <strong>Botonera</strong>

                    <span>›</span>

                    {parentItem ? (
                        <strong>{parentItem.title}</strong>
                    ) : isEditing && menuItem?.parent_id ? (
                        <strong>Subbotón</strong>
                    ) : (
                        <strong>Botón principal</strong>
                    )}
                </div>
            </div>

            {/* CAMPOS */}

            <div className="menu-item-form__body">
                {/* NOMBRE */}

                <div className="menu-item-form__field">
                    <label htmlFor="title">Nombre del botón</label>

                    <input
                        id="title"
                        type="text"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData("title", event.target.value)
                        }
                        placeholder="Ej. Institucional"
                        autoFocus
                    />

                    {form.errors.title && (
                        <span className="menu-item-form__error">
                            {form.errors.title}
                        </span>
                    )}
                </div>

                {/* TIPO DE DESTINO */}

                <div className="menu-item-form__field">
                    <label htmlFor="destination_type">Tipo de destino</label>

                    <select
                        id="destination_type"
                        value={form.data.destination_type}
                        onChange={(event) =>
                            handleDestinationChange(event.target.value)
                        }
                    >
                        <option value="url">Enlace web</option>

                        <option value="pdf">Archivo PDF</option>

                        <option value="page">Página interna</option>
                    </select>

                    {form.errors.destination_type && (
                        <span className="menu-item-form__error">
                            {form.errors.destination_type}
                        </span>
                    )}
                </div>

                {/* PÁGINA INSTITUCIONAL */}

                {form.data.destination_type === "page" && (
                    <div className="menu-item-form__field">
                        <label htmlFor="page_id">Página institucional</label>

                        <select
                            id="page_id"
                            value={form.data.page_id}
                            onChange={(event) =>
                                form.setData("page_id", event.target.value)
                            }
                        >
                            <option value="">Seleccioná una página</option>

                            {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.title}
                                </option>
                            ))}
                        </select>

                        {pages.length === 0 && (
                            <span className="menu-item-form__help">
                                No hay páginas institucionales publicadas.
                            </span>
                        )}

                        {form.errors.page_id && (
                            <span className="menu-item-form__error">
                                {form.errors.page_id}
                            </span>
                        )}
                    </div>
                )}

                {/* URL */}

                {form.data.destination_type === "url" && (
                    <div className="menu-item-form__field">
                        <label htmlFor="url">URL</label>

                        <input
                            id="url"
                            type="url"
                            value={form.data.url}
                            onChange={(event) =>
                                form.setData("url", event.target.value)
                            }
                            placeholder="https://ejemplo.com"
                        />

                        <span className="menu-item-form__help">
                            Ingresá la dirección web a la que llevará este
                            botón.
                        </span>

                        {form.errors.url && (
                            <span className="menu-item-form__error">
                                {form.errors.url}
                            </span>
                        )}
                    </div>
                )}

                {/* PDF */}

                {form.data.destination_type === "pdf" && (
                    <div className="menu-item-form__field">
                        <label htmlFor="file">Archivo PDF</label>

                        <input
                            id="file"
                            type="file"
                            accept="application/pdf"
                            onChange={(event) =>
                                form.setData(
                                    "file",
                                    event.target.files[0] ?? null,
                                )
                            }
                        />

                        <span className="menu-item-form__help">
                            Solo archivos PDF de hasta 10 MB.
                        </span>

                        {isEditing && menuItem?.file_path && (
                            <span className="menu-item-form__current-file">
                                Ya existe un archivo PDF asociado. Podés
                                seleccionar otro para reemplazarlo.
                            </span>
                        )}

                        {form.errors.file && (
                            <span className="menu-item-form__error">
                                {form.errors.file}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* FOOTER */}

            <div className="menu-item-form__footer">
                <button
                    type="button"
                    className="menu-item-form__button menu-item-form__button--secondary"
                    onClick={handleCancel}
                    disabled={form.processing}
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="menu-item-form__button menu-item-form__button--primary"
                    disabled={form.processing}
                >
                    {form.processing
                        ? "Guardando..."
                        : isEditing
                          ? "Guardar cambios"
                          : "Crear botón"}
                </button>
            </div>
        </form>
    );
}
