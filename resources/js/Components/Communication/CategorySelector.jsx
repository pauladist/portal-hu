import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import "./TaxonomySelector.css";

export default function CategorySelector({
    categories = [],
    selected = [],
    onChange,
    createUrl,
    error = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [newCategory, setNewCategory] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [localCategories, setLocalCategories] =
        useState(categories);

    const [openMenuId, setOpenMenuId] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Sincronizar categorías locales
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setLocalCategories((current) => {
            const currentIds = new Set(
                current.map((category) => Number(category.id))
            );

            const incoming = categories.filter(
                (category) =>
                    !currentIds.has(Number(category.id))
            );

            const updatedCurrent = current.map(
                (currentCategory) => {
                    const freshCategory = categories.find(
                        (category) =>
                            Number(category.id) ===
                            Number(currentCategory.id)
                    );

                    return freshCategory
                        ? {
                              ...currentCategory,
                              ...freshCategory,
                          }
                        : currentCategory;
                }
            );

            return [...updatedCurrent, ...incoming];
        });
    }, [categories]);

    /*
    |--------------------------------------------------------------------------
    | IDs seleccionados
    |--------------------------------------------------------------------------
    */

    const selectedIds = useMemo(
        () => selected.map(Number),
        [selected]
    );

    /*
    |--------------------------------------------------------------------------
    | Categorías visibles fuera del selector
    |--------------------------------------------------------------------------
    */

    const visibleCategories = useMemo(() => {
        const selectedCategories = localCategories.filter(
            (category) =>
                selectedIds.includes(Number(category.id))
        );

        const availableCategories = localCategories
            .filter(
                (category) =>
                    !selectedIds.includes(
                        Number(category.id)
                    )
            )
            .slice(0, 6);

        const merged = [
            ...selectedCategories,
            ...availableCategories,
        ];

        return merged.filter(
            (category, index, self) =>
                self.findIndex(
                    (item) =>
                        Number(item.id) ===
                        Number(category.id)
                ) === index
        );
    }, [localCategories, selectedIds]);

    /*
    |--------------------------------------------------------------------------
    | Resultados del buscador
    |--------------------------------------------------------------------------
    */

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return localCategories;
        }

        return localCategories.filter((category) =>
            category.title
                .toLowerCase()
                .includes(term)
        );
    }, [localCategories, search]);

    /*
    |--------------------------------------------------------------------------
    | Abrir selector
    |--------------------------------------------------------------------------
    */

    const openSelector = () => {
        setIsOpen(true);
        setSearch("");
        setCreateError("");
        setOpenMenuId(null);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };

    /*
    |--------------------------------------------------------------------------
    | Cerrar selector
    |--------------------------------------------------------------------------
    */

    const closeSelector = () => {
        setIsOpen(false);
        setSearch("");
        setNewCategory("");
        setCreateError("");
        setOpenMenuId(null);
        setEditingId(null);
        setEditingTitle("");
    };

    /*
    |--------------------------------------------------------------------------
    | Click afuera
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target
                )
            ) {
                closeSelector();
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Escape
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeSelector();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Seleccionar / quitar
    |--------------------------------------------------------------------------
    */

    const toggleCategory = (categoryId) => {
        const id = Number(categoryId);

        if (selectedIds.includes(id)) {
            onChange(
                selected.filter(
                    (selectedId) =>
                        Number(selectedId) !== id
                )
            );

            return;
        }

        onChange([...selected, id]);
    };

    /*
    |--------------------------------------------------------------------------
    | CSRF
    |--------------------------------------------------------------------------
    */

    const getXsrfToken = () => {
        const cookie = document.cookie
            .split("; ")
            .find((row) =>
                row.startsWith("XSRF-TOKEN=")
            );

        if (!cookie) {
            return null;
        }

        return decodeURIComponent(
            cookie.substring("XSRF-TOKEN=".length)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Crear categoría
    |--------------------------------------------------------------------------
    */

    const handleCreateCategory = async () => {
        const title = newCategory.trim();

        if (!title || creating) {
            return;
        }

        setCreating(true);
        setCreateError("");

        try {
            const csrfToken =
                document
                    .querySelector(
                        'meta[name="csrf-token"]'
                    )
                    ?.getAttribute("content") || "";

            const xsrfToken = getXsrfToken();

            const response = await fetch(createUrl, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",

                    ...(csrfToken
                        ? {
                              "X-CSRF-TOKEN":
                                  csrfToken,
                          }
                        : {}),

                    ...(xsrfToken
                        ? {
                              "X-XSRF-TOKEN":
                                  xsrfToken,
                          }
                        : {}),
                },
                body: JSON.stringify({
                    title,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setCreateError(
                    result.errors?.title?.[0] ||
                        result.message ||
                        "No se pudo crear la categoría."
                );

                return;
            }

            const createdCategory =
                result.category ?? result;

            const createdId = Number(
                createdCategory.id
            );

            setLocalCategories((current) => [
                ...current,
                createdCategory,
            ]);

            if (!selectedIds.includes(createdId)) {
                onChange([
                    ...selected,
                    createdId,
                ]);
            }

            setNewCategory("");
            setSearch("");
            setCreateError("");
            setIsOpen(false);
        } catch (error) {
            console.error(
                "Error al crear categoría:",
                error
            );

            setCreateError(
                "Ocurrió un error al crear la categoría."
            );
        } finally {
            setCreating(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Editar categoría
    |--------------------------------------------------------------------------
    */

    const startEditing = (category) => {
        setEditingId(Number(category.id));
        setEditingTitle(category.title);
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    const handleUpdateCategory = async (
        categoryId
    ) => {
        const title = editingTitle.trim();

        if (!title) {
            return;
        }

        try {
            const csrfToken =
                document
                    .querySelector(
                        'meta[name="csrf-token"]'
                    )
                    ?.getAttribute("content") || "";

            const xsrfToken = getXsrfToken();

            const response = await fetch(
                route(
                    "news.categories.quickUpdate",
                    categoryId
                ),
                {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                        "Content-Type":
                            "application/json",

                        ...(csrfToken
                            ? {
                                  "X-CSRF-TOKEN":
                                      csrfToken,
                              }
                            : {}),

                        ...(xsrfToken
                            ? {
                                  "X-XSRF-TOKEN":
                                      xsrfToken,
                              }
                            : {}),
                    },
                    body: JSON.stringify({
                        title,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setCreateError(
                    result.errors?.title?.[0] ||
                        result.message ||
                        "No se pudo actualizar la categoría."
                );

                return;
            }

            const updatedCategory =
                result.category ?? result;

            setLocalCategories((current) =>
                current.map((category) =>
                    Number(category.id) ===
                    Number(categoryId)
                        ? {
                              ...category,
                              ...updatedCategory,
                          }
                        : category
                )
            );

            cancelEditing();
        } catch (error) {
            console.error(
                "Error al actualizar categoría:",
                error
            );

            setCreateError(
                "Ocurrió un error al actualizar la categoría."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar categoría
    |--------------------------------------------------------------------------
    */

    const handleDeleteCategory = async (
        categoryId
    ) => {
        const category = localCategories.find(
            (item) =>
                Number(item.id) ===
                Number(categoryId)
        );

        if (!category) {
            return;
        }

        const confirmed = window.confirm(
            `¿Eliminar la categoría "${category.title}"?\n\nLa categoría se quitará de las noticias que la tengan asignada.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const csrfToken =
                document
                    .querySelector(
                        'meta[name="csrf-token"]'
                    )
                    ?.getAttribute("content") || "";

            const xsrfToken = getXsrfToken();

            const response = await fetch(
                route(
                    "news.categories.quickDestroy",
                    categoryId
                ),
                {
                    method: "DELETE",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",

                        ...(csrfToken
                            ? {
                                  "X-CSRF-TOKEN":
                                      csrfToken,
                              }
                            : {}),

                        ...(xsrfToken
                            ? {
                                  "X-XSRF-TOKEN":
                                      xsrfToken,
                              }
                            : {}),
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setCreateError(
                    result.message ||
                        "No se pudo eliminar la categoría."
                );

                return;
            }

            setLocalCategories((current) =>
                current.filter(
                    (item) =>
                        Number(item.id) !==
                        Number(categoryId)
                )
            );

            onChange(
                selected.filter(
                    (id) =>
                        Number(id) !==
                        Number(categoryId)
                )
            );

            setOpenMenuId(null);
        } catch (error) {
            console.error(
                "Error al eliminar categoría:",
                error
            );

            setCreateError(
                "Ocurrió un error al eliminar la categoría."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="news-taxonomy-selector"
            ref={containerRef}
        >
            {/* =====================================================
                CHIPS EXTERIORES
            ====================================================== */}

            <div className="news-chip-list">
                {visibleCategories.map((category) => {
                    const id = Number(category.id);
                    const isSelected =
                        selectedIds.includes(id);

                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={
                                isSelected
                                    ? "news-chip selected"
                                    : "news-chip"
                            }
                            onClick={() =>
                                toggleCategory(id)
                            }
                        >
                            {category.title}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className="news-chip news-chip-add"
                    onClick={openSelector}
                    aria-label="Agregar categoría"
                >
                    <span className="material-symbols-outlined">
                        add
                    </span>
                </button>
            </div>

            {error && (
                <span className="news-form-error">
                    {error}
                </span>
            )}

            {createError && !isOpen && (
                <span className="news-form-error">
                    {createError}
                </span>
            )}

            {/* =====================================================
                POPOVER
            ====================================================== */}

            {isOpen && (
                <div className="news-taxonomy-popover">
                    <div className="news-taxonomy-search">
                        <span className="material-symbols-outlined">
                            search
                        </span>

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Buscar categoría..."
                        />
                    </div>

                    <div className="news-taxonomy-options">
                        {filteredCategories.length >
                        0 ? (
                            filteredCategories.map(
                                (category) => {
                                    const id = Number(
                                        category.id
                                    );

                                    const isSelected =
                                        selectedIds.includes(
                                            id
                                        );

                                    if (
                                        editingId === id
                                    ) {
                                        return (
                                            <div
                                                key={
                                                    category.id
                                                }
                                                className="news-taxonomy-option editing"
                                            >
                                                <input
                                                    type="text"
                                                    value={
                                                        editingTitle
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setEditingTitle(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    onKeyDown={(
                                                        event
                                                    ) => {
                                                        if (
                                                            event.key ===
                                                            "Enter"
                                                        ) {
                                                            event.preventDefault();

                                                            handleUpdateCategory(
                                                                id
                                                            );
                                                        }

                                                        if (
                                                            event.key ===
                                                            "Escape"
                                                        ) {
                                                            cancelEditing();
                                                        }
                                                    }}
                                                    autoFocus
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateCategory(
                                                            id
                                                        )
                                                    }
                                                    aria-label="Guardar"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        check
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                    aria-label="Cancelar"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        close
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={
                                                category.id
                                            }
                                            className={
                                                isSelected
                                                    ? "news-taxonomy-option selected"
                                                    : "news-taxonomy-option"
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="news-taxonomy-option-main"
                                                onClick={() =>
                                                    toggleCategory(
                                                        id
                                                    )
                                                }
                                            >
                                                <span>
                                                    {
                                                        category.title
                                                    }
                                                </span>

                                                {isSelected && (
                                                    <span className="material-symbols-outlined news-taxonomy-check">
                                                        check
                                                    </span>
                                                )}
                                            </button>

                                            <div className="news-taxonomy-option-actions">
                                                {openMenuId ===
                                                id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="news-taxonomy-action edit"
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                event.stopPropagation();

                                                                startEditing(
                                                                    category
                                                                );
                                                            }}
                                                            aria-label="Editar categoría"
                                                        >
                                                            <span className="material-symbols-outlined">
                                                                edit
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="news-taxonomy-action delete"
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                event.stopPropagation();

                                                                handleDeleteCategory(
                                                                    id
                                                                );
                                                            }}
                                                            aria-label="Eliminar categoría"
                                                        >
                                                            <span className="material-symbols-outlined">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="news-taxonomy-more"
                                                        onClick={(
                                                            event
                                                        ) => {
                                                            event.stopPropagation();

                                                            setOpenMenuId(
                                                                id
                                                            );
                                                        }}
                                                        aria-label="Más opciones"
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            more_vert
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="news-taxonomy-empty">
                                No se encontraron
                                categorías.
                            </div>
                        )}
                    </div>

                    <div className="news-taxonomy-create">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(event) =>
                                setNewCategory(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    event.preventDefault();

                                    handleCreateCategory();
                                }
                            }}
                            placeholder="Nueva categoría..."
                            disabled={creating}
                        />

                        <button
                            type="button"
                            onClick={
                                handleCreateCategory
                            }
                            disabled={
                                creating ||
                                !newCategory.trim()
                            }
                        >
                            {creating
                                ? "Creando..."
                                : "Crear"}
                        </button>
                    </div>

                    {createError && (
                        <div className="news-taxonomy-create-error">
                            {createError}
                        </div>
                    )}

                    <button
                        type="button"
                        className="news-taxonomy-close"
                        onClick={closeSelector}
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
    );
}