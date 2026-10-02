import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

import PanelLayout from "../../Layouts/PanelLayout";
import MenuTree from "./Botonera/Components/MenuTree";
import MenuItemForm from "./Botonera/Form/MenuItemForm";

import "./Botonera.css";

/*
|--------------------------------------------------------------------------
| Helpers para actualizar el árbol localmente (optimistic UI)
|--------------------------------------------------------------------------
*/

const updateItem = (items, id, changes) =>
    items.map((item) => {
        if (item.id === id) {
            return { ...item, ...changes };
        }

        if (item.children?.length) {
            return {
                ...item,
                children: updateItem(item.children, id, changes),
            };
        }

        return item;
    });

// Misma lógica que el backend: saca el item y lo inserta antes del destino
const reorderSiblings = (items, itemId, targetId) => {
    const hasItem = items.some((i) => i.id === itemId);
    const hasTarget = items.some((i) => i.id === targetId);

    if (hasItem && hasTarget) {
        const moved = items.find((i) => i.id === itemId);
        const rest = items.filter((i) => i.id !== itemId);
        const index = rest.findIndex((i) => i.id === targetId);

        return [...rest.slice(0, index), moved, ...rest.slice(index)];
    }

    return items.map((item) =>
        item.children?.length
            ? {
                  ...item,
                  children: reorderSiblings(item.children, itemId, targetId),
              }
            : item,
    );
};

// Sin barra de progreso, sin perder scroll ni estado, y recargando solo lo necesario
const silentVisit = {
    preserveScroll: true,
    preserveState: true,
    showProgress: false,
    only: ["menuItems", "errors"],
};

export default function Botonera({ menuItems: serverItems = [] }) {
    const [menuItems, setMenuItems] = useState(serverItems);

    // Cuando el servidor responde, se sincroniza con lo real
    useEffect(() => {
        setMenuItems(serverItems);
    }, [serverItems]);

    const [openItems, setOpenItems] = useState({});
    const [openActionId, setOpenActionId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Notificación
    |--------------------------------------------------------------------------
    */

    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timer = setTimeout(() => {
            setToast(null);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast]);

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
    | Accesos rápidos
    |--------------------------------------------------------------------------
    */

    const quickLinksCount = useMemo(() => {
        const countQuickLinks = (items) => {
            return items.reduce((total, item) => {
                const currentItem = item.is_quick_link ? 1 : 0;

                const childrenCount = countQuickLinks(item.children || []);

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

    const toggleActionMenu = (id) => {
        setOpenActionId((current) => (current === id ? null : id));
    };

    const closeActionMenu = () => {
        setOpenActionId(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Estado activo / inactivo
    |--------------------------------------------------------------------------
    */

    const toggleStatus = (item) => {
        const previous = menuItems;

        setMenuItems((current) =>
            updateItem(current, item.id, { is_active: !item.is_active }),
        );

        router.patch(
            `/admin/menu-items/${item.id}/status`,
            { is_active: !item.is_active },
            {
                ...silentVisit,
                onError: () => setMenuItems(previous),
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Acceso rápido
    |--------------------------------------------------------------------------
    */

    const toggleQuickLink = (item) => {
        // Si no es acceso rápido y ya hay 8, no se permite agregar
        if (!item.is_quick_link && quickLinksLimitReached) {
            return;
        }

        const previous = menuItems;

        setMenuItems((current) =>
            updateItem(current, item.id, {
                is_quick_link: !item.is_quick_link,
            }),
        );

        router.patch(
            `/admin/menu-items/${item.id}/quick-link`,
            {},
            {
                ...silentVisit,
                onError: () => setMenuItems(previous),
            },
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

        const previous = menuItems;
        const draggedId = draggedItem.id;

        // Si son de distinto nivel, reorderSiblings no cambia nada
        // y el backend devuelve el error de jerarquía.
        setMenuItems((current) =>
            reorderSiblings(current, draggedId, targetItem.id),
        );

        router.patch(
            "/admin/menu-items/reorder",
            {
                item_id: draggedId,
                target_id: targetItem.id,
            },
            {
                ...silentVisit,

                onSuccess: () => {
                    setToast({
                        type: "success",
                        message: "Orden actualizado correctamente.",
                    });
                },

                onError: () => {
                    setMenuItems(previous);

                    setToast({
                        type: "error",
                        message:
                            "No se puede modificar la jerarquía establecida. Solo podés reordenar elementos dentro del mismo nivel.",
                    });
                },

                onFinish: () => {
                    setDraggedItem(null);
                },
            },
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
                {/* TOAST */}

                {toast && (
                    <div
                        className={`botonera-toast botonera-toast--${toast.type}`}
                    >
                        <div className="botonera-toast__content">
                            <div className="botonera-toast__icon">
                                {toast.type === "success" ? "✓" : "!"}
                            </div>

                            <div className="botonera-toast__text">
                                <strong>
                                    {toast.type === "success"
                                        ? "Orden actualizado"
                                        : "Acción no permitida"}
                                </strong>

                                <p>{toast.message}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="botonera-toast__close"
                            onClick={() => setToast(null)}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>
                )}

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

                {/* FORMULARIO */}

                {formMode && (
                    <div
                        className="botonera-form-modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                handleCloseForm();
                            }
                        }}
                    >
                        <div
                            className="botonera-form-modal"
                            role="dialog"
                            aria-modal="true"
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
                                        formMode === "edit" ? "edit" : "create"
                                    }
                                    menuItem={selectedItem}
                                    parentItem={parentItem}
                                    onCancel={handleCloseForm}
                                />
                            </div>
                        </div>
                    </div>
                )}

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

                            <p>Todavía no hay elementos en la botonera.</p>
                        </div>
                    ) : (
                        <MenuTree
                            items={menuItems}
                            level={0}
                            openItems={openItems}
                            toggleItem={toggleItem}
                            toggleStatus={toggleStatus}
                            toggleQuickLink={toggleQuickLink}
                            quickLinksLimitReached={quickLinksLimitReached}
                            draggedItem={draggedItem}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onAddChild={handleAddChild}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            openActionId={openActionId}
                            toggleActionMenu={toggleActionMenu}
                            closeActionMenu={closeActionMenu}
                        />
                    )}
                </div>

                {/* MODAL DE ELIMINACIÓN */}

                {itemToDelete && (
                    <div
                        className="delete-modal-overlay"
                        onClick={cancelDelete}
                    >
                        <div
                            className="delete-modal"
                            onClick={(event) => event.stopPropagation()}
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

                                <span>Esta acción no se puede deshacer.</span>
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