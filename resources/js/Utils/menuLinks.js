/**
 * Devuelve el href de un botón de la botonera según su tipo de destino.
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

/**
 * Indica si una URL apunta a otro sistema (otro origen http/https).
 */
function isExternalUrl(url) {
    if (!url || url === "#") {
        return false;
    }

    // Ruta interna del portal: "/noticias" (pero "//dominio.com" es externa)
    if (url.startsWith("/") && !url.startsWith("//")) {
        return false;
    }

    try {
        const parsed = new URL(url, window.location.origin);

        // mailto:, tel:, etc. no abren pestaña nueva
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return false;
        }

        return parsed.origin !== window.location.origin;
    } catch {
        return false;
    }
}

/**
 * Devuelve si el botón debe abrirse en una pestaña nueva:
 * solo PDFs y URLs externas. Noticias y páginas internas quedan
 * en la misma pestaña.
 */
export function opensInNewTab(item) {
    if (item.destination_type === "pdf" && item.file_path) {
        return true;
    }

    if (item.destination_type === "page") {
        return false;
    }

    return isExternalUrl(item.url);
}

/**
 * Props listas para esparcir en un <a>: href + target/rel cuando corresponde.
 *
 *   <a {...getMenuItemLinkProps(item)}>...</a>
 */
export function getMenuItemLinkProps(item) {
    const href = getMenuItemHref(item);

    if (opensInNewTab(item)) {
        return {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
        };
    }

    return { href };
}