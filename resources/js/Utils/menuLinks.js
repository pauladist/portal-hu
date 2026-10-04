/**
 * Devuelve el href de un botón de la botonera según su tipo de destino.
 * Todos abren en la misma pestaña (no se usa target="_blank").
 */
export function getMenuItemHref(item) {
    if (item.destination_type === "pdf" && item.file_path) {
        return `/storage/${item.file_path}`;
    }

    if (item.destination_type === "page" && item.page?.slug) {
        return `/paginas/${item.page.slug}`;
    }

    return item.url ?? "#";
}