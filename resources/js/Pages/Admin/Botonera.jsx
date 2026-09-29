import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

import PanelLayout from "../../Layouts/PanelLayout";
import MenuTree from "./Botonera/Components/MenuTree";
import MenuItemForm from "./Botonera/Form/MenuItemForm";

import "./Botonera.css";

export default function Botonera({ menuItems = [] }) {
    const [openItems, setOpenItems] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Formulario
    |--------------------------------------------------------------------------
    */

    const [formMode, setFormMode] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [parentItem, setParentItem] = useState(null);

    const [itemToDelete, setItemToDelete] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Bloquear scroll cuando hay un modal abierto
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!formMode && !itemToDelete) {
            return;
        }

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [formMode, itemToDelete]);

    /*
    |--------------------------------------------------------------------------
    | Accesos rápidos
    |--------------------------------------------------------------------------
    */

    const quickLinksCount = useMemo(() => {
        const countQuickLinks = (items) => {
            return items.reduce((total, item) => {
                const currentItem = item.is_quick_link ? 1 : 0;

                const childrenCount = countQuickLinks(
                    item.children || []
                );

                return total + currentItem + childrenCount;
            }, 0);
        };

        return countQuickLinks(menuItems);
    }, [menuItems]);

    const quickLinksLimitReached = quickLinksCount >= 8;

    /*
    |--------------------------------------------------------------------------
    | Expandir / contraer
    |--------------------------------------------------------------------------
    */

    const toggleItem = (id) => {
        setOpenItems((current) => ({
            ...current,
            [id]: !current[id],
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Estado activo / inactivo
    |--------------------------------------------------------------------------
    */

    const toggleStatus = (item) => {
        router.patch(
            `/admin/menu-items/${item.id}/status`,
            {
                is_active: !item.is_active,
            },
            {
                preserveScroll: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Acceso rápido
    |--------------------------------------------------------------------------
    */

    const toggleQuickLink = (item) => {
        /*
         * Si ya es acceso rápido, siempre permitimos quitarlo.
         */
        if (item.is_quick_link) {
            router.patch(
                `/admin/menu-items/${item.id}/quick-link`,
                {},
                {
                    preserveScroll: true,
                }
            );

            return;
        }

        /*
         * Si ya hay 8, no permitimos agregar otro.
         */
        if (quickLinksLimitReached) {
            return;
        }

        router.patch(
            `/admin/menu-items/${item.id}/quick-link`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Drag & drop
    |--------------------------------------------------------------------------
    */

    const handleDragStart = (item) => {
        setDraggedItem(item);
    };

    const handleDrop = (targetItem) => {
        if (!draggedItem) {
            return;
        }

        if (draggedItem.id === targetItem.id) {
            setDraggedItem(null);
            return;
        }

        router.patch(
            "/admin/menu-items/reorder",
            {
                item_id: draggedItem.id,
                target_id: targetItem.id,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setDraggedItem(null);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Acciones del formulario
    |--------------------------------------------------------------------------
    */

    // Crear botón principal
    const handleCreate = () => {
        setSelectedItem(null);
        setParentItem(null);
        setFormMode("create");
    };

    // Crear subbotón
    const handleAddChild = (item) => {
        setSelectedItem(null);
        setParentItem(item);
        setFormMode("child");
    };

    // Editar botón
    const handleEdit = (item) => {
        setSelectedItem(item);
        setParentItem(null);
        setFormMode("edit");
    };

    // Cerrar formulario
    const handleCloseForm = () => {
        setFormMode(null);
        setSelectedItem(null);
        setParentItem(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const handleDelete = (item) => {
        setItemToDelete(item);
    };

    const confirmDelete = () => {
        if (!itemToDelete) {
            return;
        }

        router.delete(`/admin/menu-items/${itemToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setItemToDelete(null);
            },
        });
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <PanelLayout title="Botonera">
            <div className="botonera-page">

                {/* HEADER */}

                <div className="botonera-header">
                    <div>
                        <h1>Botonera</h1>

                        <p>
                            Administrá la estructura de navegación del portal.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="botonera-primary-button"
                        onClick={handleCreate}
                    >
                        <span>+</span>
                        Agregar botón
                    </button>
                </div>

                {/* INFORMACIÓN DE ACCESOS RÁPIDOS */}

                <div className="botonera-info">
                    <span>Accesos rápidos</span>

                    <strong>{quickLinksCount} / 8</strong>
                </div>

                {/* ÁRBOL */}

                <div className="botonera-content">
                    {menuItems.length === 0 ? (
                        <div className="botonera-empty">
                            <h3>No hay botones cargados</h3>

                            <p>
                                Todavía no hay elementos en la botonera.
                            </p>
                        </div>
                    ) : (
                        <MenuTree
                            items={menuItems}
                            level={0}
                            openItems={openItems}
                            toggleItem={toggleItem}
                            toggleStatus={toggleStatus}
                            toggleQuickLink={toggleQuickLink}
                            quickLinksLimitReached={
                                quickLinksLimitReached
                            }
                            draggedItem={draggedItem}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onAddChild={handleAddChild}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                {/* =====================================================
                    MODAL DEL FORMULARIO
                    ===================================================== */}

                {formMode && (
                    <div
                        className="botonera-form-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget
                            ) {
                                handleCloseForm();
                            }
                        }}
                    >
                        <div
                            className="botonera-form-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label={
                                formMode === "edit"
                                    ? "Editar botón"
                                    : parentItem
                                        ? "Agregar subbotón"
                                        : "Crear botón principal"
                            }
                        >
                            <button
                                type="button"
                                className="botonera-form-modal__close"
                                onClick={handleCloseForm}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>

                            <div className="botonera-form-modal__content">
                                <MenuItemForm
                                    mode={
                                        formMode === "edit"
                                            ? "edit"
                                            : "create"
                                    }
                                    menuItem={selectedItem}
                                    parentItem={parentItem}
                                    onCancel={handleCloseForm}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    MODAL ELIMINAR
                    ===================================================== */}

                {itemToDelete && (
                    <div
                        className="delete-modal-overlay"
                        onClick={cancelDelete}
                    >
                        <div
                            className="delete-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="delete-modal__content">
                                <h2>Eliminar botón</h2>

                                <p>
                                    ¿Estás segura de que querés eliminar
                                    <strong>
                                        {` "${itemToDelete.title}"`}
                                    </strong>
                                    ?
                                </p>

                                <span>
                                    Esta acción no se puede deshacer.
                                </span>
                            </div>

                            <div className="delete-modal__actions">
                                <button
                                    type="button"
                                    className="delete-modal__cancel"
                                    onClick={cancelDelete}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="delete-modal__confirm"
                                    onClick={confirmDelete}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}