import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import "./TaxonomySelector.css";

export default function TagSelector({
    tags = [],
    selected = [],
    onChange,
    createUrl,
    error = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [newTag, setNewTag] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [localTags, setLocalTags] = useState(tags);

    const [openMenuId, setOpenMenuId] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Sincronizar tags locales
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setLocalTags((current) => {
            const currentIds = new Set(
                current.map((tag) => Number(tag.id))
            );

            const incoming = tags.filter(
                (tag) =>
                    !currentIds.has(Number(tag.id))
            );

            const updatedCurrent = current.map(
                (currentTag) => {
                    const freshTag = tags.find(
                        (tag) =>
                            Number(tag.id) ===
                            Number(currentTag.id)
                    );

                    return freshTag
                        ? {
                              ...currentTag,
                              ...freshTag,
                          }
                        : currentTag;
                }
            );

            return [...updatedCurrent, ...incoming];
        });
    }, [tags]);

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
    | Tags visibles fuera del selector
    |--------------------------------------------------------------------------
    */

    const visibleTags = useMemo(() => {
        const selectedTags = localTags.filter(
            (tag) =>
                selectedIds.includes(Number(tag.id))
        );

        const availableTags = localTags
            .filter(
                (tag) =>
                    !selectedIds.includes(
                        Number(tag.id)
                    )
            )
            .slice(0, 6);

        const merged = [
            ...selectedTags,
            ...availableTags,
        ];

        return merged.filter(
            (tag, index, self) =>
                self.findIndex(
                    (item) =>
                        Number(item.id) ===
                        Number(tag.id)
                ) === index
        );
    }, [localTags, selectedIds]);

    /*
    |--------------------------------------------------------------------------
    | Resultados del buscador
    |--------------------------------------------------------------------------
    */

    const filteredTags = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return localTags;
        }

        return localTags.filter((tag) =>
            tag.title
                .toLowerCase()
                .includes(term)
        );
    }, [localTags, search]);

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
        setNewTag("");
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

    const toggleTag = (tagId) => {
        const id = Number(tagId);

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
    | Crear tag
    |--------------------------------------------------------------------------
    */

    const handleCreateTag = async () => {
        const title = newTag.trim();

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
                        "No se pudo crear el tag."
                );

                return;
            }

            const createdTag =
                result.tag ?? result;

            const createdId = Number(
                createdTag.id
            );

            setLocalTags((current) => [
                ...current,
                createdTag,
            ]);

            if (!selectedIds.includes(createdId)) {
                onChange([
                    ...selected,
                    createdId,
                ]);
            }

            setNewTag("");
            setSearch("");
            setCreateError("");
            setIsOpen(false);
        } catch (error) {
            console.error(
                "Error al crear tag:",
                error
            );

            setCreateError(
                "Ocurrió un error al crear el tag."
            );
        } finally {
            setCreating(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Editar tag
    |--------------------------------------------------------------------------
    */

    const startEditing = (tag) => {
        setEditingId(Number(tag.id));
        setEditingTitle(tag.title);
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    const handleUpdateTag = async (tagId) => {
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
                    "news.tags.quickUpdate",
                    tagId
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
                        "No se pudo actualizar el tag."
                );

                return;
            }

            const updatedTag =
                result.tag ?? result;

            setLocalTags((current) =>
                current.map((tag) =>
                    Number(tag.id) ===
                    Number(tagId)
                        ? {
                              ...tag,
                              ...updatedTag,
                          }
                        : tag
                )
            );

            cancelEditing();
        } catch (error) {
            console.error(
                "Error al actualizar tag:",
                error
            );

            setCreateError(
                "Ocurrió un error al actualizar el tag."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Eliminar tag
    |--------------------------------------------------------------------------
    */

    const handleDeleteTag = async (tagId) => {
        const tag = localTags.find(
            (item) =>
                Number(item.id) ===
                Number(tagId)
        );

        if (!tag) {
            return;
        }

        const confirmed = window.confirm(
            `¿Eliminar el tag "${tag.title}"?\n\nEl tag se quitará de las noticias que lo tengan asignado.`
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
                    "news.tags.quickDestroy",
                    tagId
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
                        "No se pudo eliminar el tag."
                );

                return;
            }

            setLocalTags((current) =>
                current.filter(
                    (item) =>
                        Number(item.id) !==
                        Number(tagId)
                )
            );

            onChange(
                selected.filter(
                    (id) =>
                        Number(id) !==
                        Number(tagId)
                )
            );

            setOpenMenuId(null);
        } catch (error) {
            console.error(
                "Error al eliminar tag:",
                error
            );

            setCreateError(
                "Ocurrió un error al eliminar el tag."
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
                {visibleTags.map((tag) => {
                    const id = Number(tag.id);
                    const isSelected =
                        selectedIds.includes(id);

                    return (
                        <button
                            key={tag.id}
                            type="button"
                            className={
                                isSelected
                                    ? "news-chip selected"
                                    : "news-chip"
                            }
                            onClick={() =>
                                toggleTag(id)
                            }
                        >
                            {tag.title}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className="news-chip news-chip-add"
                    onClick={openSelector}
                    aria-label="Agregar tag"
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
                            placeholder="Buscar tag..."
                        />
                    </div>

                    <div className="news-taxonomy-options">
                        {filteredTags.length > 0 ? (
                            filteredTags.map((tag) => {
                                const id = Number(
                                    tag.id
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
                                            key={tag.id}
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

                                                        handleUpdateTag(
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
                                                    handleUpdateTag(
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
                                        key={tag.id}
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
                                                toggleTag(
                                                    id
                                                )
                                            }
                                        >
                                            <span>
                                                {tag.title}
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
                                                                tag
                                                            );
                                                        }}
                                                        aria-label="Editar tag"
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

                                                            handleDeleteTag(
                                                                id
                                                            );
                                                        }}
                                                        aria-label="Eliminar tag"
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
                            })
                        ) : (
                            <div className="news-taxonomy-empty">
                                No se encontraron tags.
                            </div>
                        )}
                    </div>

                    <div className="news-taxonomy-create">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(event) =>
                                setNewTag(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    event.preventDefault();

                                    handleCreateTag();
                                }
                            }}
                            placeholder="Nuevo tag..."
                            disabled={creating}
                        />

                        <button
                            type="button"
                            onClick={handleCreateTag}
                            disabled={
                                creating ||
                                !newTag.trim()
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