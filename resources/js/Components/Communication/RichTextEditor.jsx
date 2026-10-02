import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import "./RichTextEditor.css";


/* =========================================================
   FONT FAMILY
========================================================= */

const FontFamily = Extension.create({
    name: "fontFamily",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,

                attributes: {
                    fontFamily: {
                        default: null,

                        parseHTML: (element) =>
                            element.style.fontFamily || null,

                        renderHTML: (attributes) => {
                            if (!attributes.fontFamily) {
                                return {};
                            }

                            return {
                                style: `font-family: ${attributes.fontFamily}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontFamily:
                (fontFamily) =>
                ({ chain }) => {
                    return chain()
                        .setMark("textStyle", {
                            fontFamily,
                        })
                        .run();
                },

            unsetFontFamily:
                () =>
                ({ chain }) => {
                    return chain()
                        .setMark("textStyle", {
                            fontFamily: null,
                        })
                        .run();
                },
        };
    },
});


/* =========================================================
   FONT SIZE
========================================================= */

const FontSize = Extension.create({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,

                attributes: {
                    fontSize: {
                        default: null,

                        parseHTML: (element) =>
                            element.style.fontSize || null,

                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }

                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize) =>
                ({ chain }) => {
                    return chain()
                        .setMark("textStyle", {
                            fontSize,
                        })
                        .run();
                },

            unsetFontSize:
                () =>
                ({ chain }) => {
                    return chain()
                        .setMark("textStyle", {
                            fontSize: null,
                        })
                        .run();
                },
        };
    },
});


/* =========================================================
   IMAGE NODE
========================================================= */

const NewsImage = Node.create({
    name: "newsImage",

    group: "block",

    atom: true,

    selectable: true,

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },

            alt: {
                default: "",
            },

            title: {
                default: "",
            },

            mediaId: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "img[data-news-image]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "img",
            mergeAttributes(HTMLAttributes, {
                "data-news-image": "",
            }),
        ];
    },
});


/* =========================================================
   FILE / PDF NODE
========================================================= */

const PdfNode = Node.create({
    name: "pdfFile",

    group: "block",

    atom: true,

    selectable: true,

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },

            title: {
                default: "Archivo",
            },

            fileName: {
                default: "Archivo",
            },

            mediaId: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-pdf-file]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-pdf-file": "",
            }),
            [
                "a",
                {
                    href: HTMLAttributes.src,
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                HTMLAttributes.fileName || "Abrir archivo",
            ],
        ];
    },
});


/* =========================================================
   VIDEO NODE
========================================================= */

const VideoNode = Node.create({
    name: "newsVideo",

    group: "block",

    atom: true,

    selectable: true,

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },

            title: {
                default: "",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-news-video]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(
                {
                    class: "news-video-wrapper",
                    "data-news-video": "",
                },
                HTMLAttributes,
            ),
            [
                "iframe",
                {
                    src: HTMLAttributes.src,
                    title:
                        HTMLAttributes.title ||
                        "Video de la noticia",
                    frameborder: "0",
                    allow:
                        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                    allowfullscreen: "true",
                },
            ],
        ];
    },
});

/* =========================================================
   YOUTUBE
========================================================= */

const getYoutubeEmbedUrl = (url) => {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname === "/watch") {
                const id = parsed.searchParams.get("v");

                if (id) {
                    return `https://www.youtube.com/embed/${id}`;
                }
            }

            if (parsed.pathname.startsWith("/shorts/")) {
                const id = parsed.pathname
                    .split("/shorts/")[1]
                    .split("/")[0];

                if (id) {
                    return `https://www.youtube.com/embed/${id}`;
                }
            }

            if (parsed.pathname.startsWith("/embed/")) {
                return url;
            }
        }

        if (parsed.hostname === "youtu.be") {
            const id = parsed.pathname
                .replace("/", "")
                .split("/")[0];

            if (id) {
                return `https://www.youtube.com/embed/${id}`;
            }
        }
    } catch {
        return null;
    }

    return null;
};


/* =========================================================
   GOOGLE DRIVE
========================================================= */

const getGoogleDriveEmbedUrl = (url) => {
    try {
        const parsed = new URL(url);

        if (
            parsed.hostname.includes("drive.google.com") &&
            parsed.pathname.includes("/file/d/")
        ) {
            const parts = parsed.pathname.split("/file/d/");

            if (parts[1]) {
                const id = parts[1].split("/")[0];

                return `https://drive.google.com/file/d/${id}/preview`;
            }
        }

        if (
            parsed.hostname.includes("drive.google.com") &&
            parsed.pathname.includes("/open")
        ) {
            const id = parsed.searchParams.get("id");

            if (id) {
                return `https://drive.google.com/file/d/${id}/preview`;
            }
        }
    } catch {
        return null;
    }

    return null;
};


/* =========================================================
   COMPONENT
========================================================= */

export default function RichTextEditor({
    value = "",
    onChange,
    onMediaChange,
}) {
    const fileInputRef = useRef(null);

    const attachmentRef = useRef(null);
    const videoRef = useRef(null);
    const linkRef = useRef(null);

    const [attachmentOpen, setAttachmentOpen] =
        useState(false);

    const [videoOpen, setVideoOpen] =
        useState(false);

    const [videoUrl, setVideoUrl] =
        useState("");

    const [videoTitle, setVideoTitle] =
        useState("");

    const [linkOpen, setLinkOpen] =
        useState(false);

    const [linkUrl, setLinkUrl] =
        useState("");

    const [mediaFiles, setMediaFiles] =
        useState([]);


    /* =====================================================
       EDITOR
    ===================================================== */

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },

                link: false,

                underline: false,
            }),

            TextStyle,

            Underline,

            Link.configure({
                openOnClick: false,

                autolink: false,

                linkOnPaste: true,

                HTMLAttributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),

            TextAlign.configure({
                types: [
                    "heading",
                    "paragraph",
                    "newsImage",
                    "pdfFile",
                    "newsVideo",
                ],
            }),

            FontFamily,

            FontSize,

            NewsImage,

            PdfNode,

            VideoNode,
        ],

        content: value,

        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },

        editorProps: {
            attributes: {
                class: "rich-text-content",
            },
        },
    });


    /* =====================================================
       SYNC EXTERNAL VALUE
    ===================================================== */

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (value !== editor.getHTML()) {
            editor.commands.setContent(
                value || "",
                false
            );
        }
    }, [value, editor]);


    /* =====================================================
       MEDIA CHANGE
    ===================================================== */

    useEffect(() => {
        onMediaChange?.(mediaFiles);
    }, [mediaFiles]);


    /* =====================================================
       CLICK OUTSIDE + ESCAPE
    ===================================================== */

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (
            attachmentRef.current &&
            !attachmentRef.current.contains(event.target)
        ) {
            setAttachmentOpen(false);
        }

        if (
            videoOpen &&
            videoRef.current &&
            !videoRef.current.contains(event.target)
        ) {
            setVideoOpen(false);
            setVideoUrl("");
            setVideoTitle("");
        }

        if (
            linkRef.current &&
            !linkRef.current.contains(event.target)
        ) {
            setLinkOpen(false);
        }
    };

            if (
                linkRef.current &&
                !linkRef.current.contains(
                    event.target
                )
            ) {
                setLinkOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key !== "Escape") {
                return;
            }

            setAttachmentOpen(false);

            setLinkOpen(false);

            setVideoOpen(false);

            setVideoUrl("");

            setVideoTitle("");
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [videoOpen]);


    /* =====================================================
       FILES
    ===================================================== */

    const handleFiles = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length || !editor) {
            return;
        }

        const newMediaFiles = [];

        files.forEach((file) => {
            const blobUrl =
                URL.createObjectURL(file);

            const mediaId =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`;

            const media = {
                id: mediaId,
                file,
                type: file.type,
                name: file.name,
                url: blobUrl,
            };

            newMediaFiles.push(media);

            /* -----------------------------------------
               IMAGE
            ----------------------------------------- */

            if (file.type.startsWith("image/")) {
                editor
                    .chain()
                    .focus()
                    .insertContent({
                        type: "newsImage",

                        attrs: {
                            src: blobUrl,

                            alt: file.name,

                            title: file.name,

                            mediaId,
                        },
                    })
                    .run();

                return;
            }


            /* -----------------------------------------
               PDF / FILE
            ----------------------------------------- */

            editor
                .chain()
                .focus()
                .insertContent({
                    type: "pdfFile",

                    attrs: {
                        src: blobUrl,

                        title: file.name,

                        fileName: file.name,

                        mediaId,
                    },
                })
                .run();
        });

        setMediaFiles((current) => [
            ...current,
            ...newMediaFiles,
        ]);

        event.target.value = "";

        setAttachmentOpen(false);
    };


    /* =====================================================
       VIDEO
    ===================================================== */

    const addVideo = () => {
        if (!editor || !videoUrl.trim()) {
            return;
        }

        const youtubeUrl =
            getYoutubeEmbedUrl(
                videoUrl.trim()
            );

        const driveUrl =
            getGoogleDriveEmbedUrl(
                videoUrl.trim()
            );

        const embedUrl =
            youtubeUrl || driveUrl;

        if (!embedUrl) {
            alert(
                "Ingresá un enlace válido de YouTube o Google Drive."
            );

            return;
        }

        editor
            .chain()
            .focus()
            .insertContent({
                type: "newsVideo",

                attrs: {
                    src: embedUrl,

                    title: videoTitle.trim(),
                },
            })
            .run();

        editor
            .chain()
            .focus()
            .insertContent("<p></p>")
            .run();

        setVideoUrl("");

        setVideoTitle("");

        setVideoOpen(false);

        setAttachmentOpen(false);
    };


    /* =====================================================
       LINK
    ===================================================== */

    const openLinkEditor = () => {
        if (!editor) {
            return;
        }

        const previousUrl =
            editor.getAttributes("link").href ||
            "";

        setLinkUrl(previousUrl);

        setLinkOpen(true);
    };


    const applyLink = () => {
        if (!editor) {
            return;
        }

        const url = linkUrl.trim();

        if (!url) {
            editor
                .chain()
                .focus()
                .unsetLink()
                .run();

            setLinkOpen(false);

            setLinkUrl("");

            return;
        }

        editor
            .chain()
            .focus()
            .setLink({
                href: url,
            })
            .run();

        setLinkOpen(false);

        setLinkUrl("");
    };


    /* =====================================================
       FONT FAMILY
    ===================================================== */

    const setFontFamily = (font) => {
        if (!editor) {
            return;
        }

        if (font === "default") {
            editor
                .chain()
                .focus()
                .unsetFontFamily()
                .run();

            return;
        }

        editor
            .chain()
            .focus()
            .setFontFamily(font)
            .run();
    };


    /* =====================================================
       FONT SIZE
    ===================================================== */

    const setFontSize = (size) => {
        if (!editor) {
            return;
        }

        if (size === "default") {
            editor
                .chain()
                .focus()
                .unsetFontSize()
                .run();

            return;
        }

        editor
            .chain()
            .focus()
            .setFontSize(size)
            .run();
    };


    /* =====================================================
       FORMAT
    ===================================================== */

    const setFormat = (format) => {
        if (!editor) {
            return;
        }

        const chain = editor
            .chain()
            .focus();

        if (format === "paragraph") {
            chain
                .setParagraph()
                .run();

            return;
        }

        if (
            ["h1", "h2", "h3", "h4", "h5", "h6"]
                .includes(format)
        ) {
            const level =
                Number(format.replace("h", ""));

            chain
                .toggleHeading({
                    level,
                })
                .run();

            return;
        }

        if (format === "code") {
            chain
                .toggleCodeBlock()
                .run();
        }
    };


    /* =====================================================
       EDITOR LOADING
    ===================================================== */

    if (!editor) {
        return null;
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="rich-text-editor">


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="rich-text-toolbar">


                {/* =================================================
                    FORMATO
                ================================================= */}

                <select
                    className="rich-text-select format-select"
                    value=""
                    onChange={(event) => {
                        setFormat(
                            event.target.value
                        );
                    }}
                >
                    <option value="">
                        Formato
                    </option>

                    <option value="paragraph">
                        Párrafo
                    </option>

                    <option value="h1">
                        Título 1
                    </option>

                    <option value="h2">
                        Título 2
                    </option>

                    <option value="h3">
                        Título 3
                    </option>

                    <option value="h4">
                        Título 4
                    </option>

                    <option value="h5">
                        Título 5
                    </option>

                    <option value="h6">
                        Título 6
                    </option>

                    <option value="code">
                        Preformateado
                    </option>
                </select>


                {/* =================================================
                    FUENTE
                ================================================= */}

                <select
                    className="rich-text-select"
                    value=""
                    onChange={(event) => {
                        setFontFamily(
                            event.target.value
                        );
                    }}
                >
                    <option value="">
                        Fuente
                    </option>

                    <option value="Arial">
                        Arial
                    </option>

                    <option value="Arial Black">
                        Arial Black
                    </option>

                    <option value="Book Antiqua">
                        Book Antiqua
                    </option>

                    <option value="Comic Sans MS">
                        Comic Sans MS
                    </option>

                    <option value="Courier New">
                        Courier New
                    </option>

                    <option value="Georgia">
                        Georgia
                    </option>

                    <option value="Helvetica">
                        Helvetica
                    </option>

                    <option value="Impact">
                        Impact
                    </option>

                    <option value="Symbol">
                        Symbol
                    </option>

                    <option value="Tahoma">
                        Tahoma
                    </option>

                    <option value="Terminal">
                        Terminal
                    </option>

                    <option value="Times New Roman">
                        Times New Roman
                    </option>

                    <option value="Trebuchet MS">
                        Trebuchet MS
                    </option>

                    <option value="Verdana">
                        Verdana
                    </option>
                </select>


                {/* =================================================
                    TAMAÑO
                ================================================= */}

                <select
                    className="rich-text-select size-select"
                    value=""
                    onChange={(event) => {
                        setFontSize(
                            event.target.value
                        );
                    }}
                >
                    <option value="">
                        Tamaño
                    </option>

                    <option value="8pt">
                        8pt
                    </option>

                    <option value="10pt">
                        10pt
                    </option>

                    <option value="12pt">
                        12pt
                    </option>

                    <option value="14pt">
                        14pt
                    </option>

                    <option value="18pt">
                        18pt
                    </option>

                    <option value="24pt">
                        24pt
                    </option>

                    <option value="36pt">
                        36pt
                    </option>
                </select>


                <span className="toolbar-divider" />


                {/* =================================================
                    NEGRITA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("bold")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    title="Negrita"
                >
                    <span className="material-symbols-outlined">
                        format_bold
                    </span>
                </button>


                {/* =================================================
                    CURSIVA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("italic")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    title="Cursiva"
                >
                    <span className="material-symbols-outlined">
                        format_italic
                    </span>
                </button>


                {/* =================================================
                    SUBRAYADO
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("underline")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleUnderline()
                            .run()
                    }
                    title="Subrayado"
                >
                    <span className="material-symbols-outlined">
                        format_underlined
                    </span>
                </button>


                {/* =================================================
                    TACHADO
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("strike")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                    title="Tachado"
                >
                    <span className="material-symbols-outlined">
                        strikethrough_s
                    </span>
                </button>


                <span className="toolbar-divider" />


                {/* =================================================
                    LISTA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("bulletList")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleBulletList()
                            .run()
                    }
                    title="Lista"
                >
                    <span className="material-symbols-outlined">
                        format_list_bulleted
                    </span>
                </button>


                {/* =================================================
                    LISTA NUMERADA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("orderedList")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleOrderedList()
                            .run()
                    }
                    title="Lista numerada"
                >
                    <span className="material-symbols-outlined">
                        format_list_numbered
                    </span>
                </button>


                {/* =================================================
                    CITA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive("blockquote")
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleBlockquote()
                            .run()
                    }
                    title="Cita"
                >
                    <span className="material-symbols-outlined">
                        format_quote
                    </span>
                </button>


                {/* =================================================
                    ALINEACIÓN IZQUIERDA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive({
                            textAlign: "left",
                        })
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setTextAlign("left")
                            .run()
                    }
                    title="Alinear a la izquierda"
                >
                    <span className="material-symbols-outlined">
                        format_align_left
                    </span>
                </button>


                {/* =================================================
                    CENTRAR
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive({
                            textAlign: "center",
                        })
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setTextAlign("center")
                            .run()
                    }
                    title="Centrar"
                >
                    <span className="material-symbols-outlined">
                        format_align_center
                    </span>
                </button>


                {/* =================================================
                    ALINEACIÓN DERECHA
                ================================================= */}

                <button
                    type="button"
                    className={`toolbar-button ${
                        editor.isActive({
                            textAlign: "right",
                        })
                            ? "is-active"
                            : ""
                    }`}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setTextAlign("right")
                            .run()
                    }
                    title="Alinear a la derecha"
                >
                    <span className="material-symbols-outlined">
                        format_align_right
                    </span>
                </button>


                <span className="toolbar-divider" />


                {/* =================================================
                    LINK
                ================================================= */}

                <div
                    className="rich-text-link-wrapper"
                    ref={linkRef}
                >
                    <button
                        type="button"
                        className={`toolbar-button ${
                            editor.isActive("link")
                                ? "is-active"
                                : ""
                        }`}
                        onClick={openLinkEditor}
                        title="Agregar enlace"
                    >
                        <span className="material-symbols-outlined">
                            link
                        </span>
                    </button>


                    {linkOpen && (
                        <div className="rich-text-popover link-popover">

                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(event) =>
                                    setLinkUrl(
                                        event.target.value
                                    )
                                }
                                placeholder="https://..."
                                autoFocus
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        event.preventDefault();

                                        applyLink();
                                    }

                                    if (
                                        event.key ===
                                        "Escape"
                                    ) {
                                        setLinkOpen(false);
                                    }
                                }}
                            />


                            <button
                                type="button"
                                onClick={applyLink}
                            >
                                Aplicar
                            </button>


                            {editor.isActive("link") && (
                                <button
                                    type="button"
                                    className="popover-danger-button"
                                    onClick={() => {
                                        editor
                                            .chain()
                                            .focus()
                                            .unsetLink()
                                            .run();

                                        setLinkOpen(false);

                                        setLinkUrl("");
                                    }}
                                >
                                    Quitar enlace
                                </button>
                            )}

                        </div>
                    )}
                </div>


                {/* =================================================
                    ADJUNTAR
                ================================================= */}

                <div
                    className="rich-text-attachment-wrapper"
                    ref={attachmentRef}
                >
                    <button
                        type="button"
                        className="toolbar-button"
                        onClick={() => {
                            setAttachmentOpen(
                                (current) =>
                                    !current
                            );

                            setVideoOpen(false);
                        }}
                        title="Adjuntar"
                    >
                        <span className="material-symbols-outlined">
                            attach_file
                        </span>
                    </button>


                    {attachmentOpen && (
                        <div className="attachment-menu">

                            <button
                                type="button"
                                onClick={() => {
                                    fileInputRef.current?.click();
                                }}
                            >
                                <span className="material-symbols-outlined">
                                    folder
                                </span>

                                <span>
                                    Archivo
                                </span>
                            </button>


                            <button
                                type="button"
                                onClick={() => {
                                    setAttachmentOpen(false);

                                    setVideoOpen(true);
                                }}
                            >
                                <span className="material-symbols-outlined">
                                    play_circle
                                </span>

                                <span>
                                    Video
                                </span>
                            </button>

                        </div>
                    )}


                    {videoOpen && (
                        <div
                            ref={videoRef}
                            className="rich-text-popover video-popover"
                        >

                            <div className="popover-title">
                                Insertar video
                            </div>


                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(event) =>
                                    setVideoUrl(
                                        event.target.value
                                    )
                                }
                                placeholder="Pegá un enlace de YouTube o Google Drive"
                                autoFocus
                            />


                            <input
                                type="text"
                                value={videoTitle}
                                onChange={(event) =>
                                    setVideoTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Título (opcional)"
                            />


                            <div className="popover-actions">

                                <button
                                    type="button"
                                    className="popover-secondary-button"
                                    onClick={() => {
                                        setVideoOpen(false);

                                        setVideoUrl("");

                                        setVideoTitle("");
                                    }}
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    onClick={addVideo}
                                >
                                    Insertar
                                </button>

                            </div>

                        </div>
                    )}
                </div>


                {/* =================================================
                    FILE INPUT
                ================================================= */}

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFiles}
                />


                <span className="toolbar-divider" />


                {/* =================================================
                    LÍNEA HORIZONTAL
                ================================================= */}

                <button
                    type="button"
                    className="toolbar-button"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setHorizontalRule()
                            .run()
                    }
                    title="Línea horizontal"
                >
                    <span className="material-symbols-outlined">
                        horizontal_rule
                    </span>
                </button>


                {/* =================================================
                    DESHACER
                ================================================= */}

                <button
                    type="button"
                    className="toolbar-button"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .undo()
                            .run()
                    }
                    disabled={!editor.can().undo()}
                    title="Deshacer"
                >
                    <span className="material-symbols-outlined">
                        undo
                    </span>
                </button>


                {/* =================================================
                    REHACER
                ================================================= */}

                <button
                    type="button"
                    className="toolbar-button"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .redo()
                            .run()
                    }
                    disabled={!editor.can().redo()}
                    title="Rehacer"
                >
                    <span className="material-symbols-outlined">
                        redo
                    </span>
                </button>


                {/* =================================================
                    LIMPIAR FORMATO
                ================================================= */}

                <button
                    type="button"
                    className="toolbar-button"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .clearNodes()
                            .unsetAllMarks()
                            .run()
                    }
                    title="Limpiar formato"
                >
                    <span className="material-symbols-outlined">
                        format_clear
                    </span>
                </button>

            </div>


            {/* =================================================
                EDITOR
            ================================================= */}

            <EditorContent editor={editor} />

        </div>
    );
}