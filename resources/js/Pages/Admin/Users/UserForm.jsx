import React from "react";
import { useForm } from "@inertiajs/react";

export default function UserForm({ user = null, onClose }) {
    const isEditing = Boolean(user);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        name: user?.name ?? "",
        last_name: user?.last_name ?? "",
        email: user?.email ?? "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing) {
            put(`/admin/users/${user.id}`, options);
        } else {
            post("/admin/users", options);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div
            className="users-form-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div className="users-form-modal">
                {/* HEADER */}
                <div className="users-form-header">
                    <div>
                        <h2>
                            {isEditing
                                ? "Editar usuario"
                                : "Crear usuario"}
                        </h2>

                        <p>
                            {isEditing
                                ? "Modificá los datos del usuario de comunicación."
                                : "Completá los datos para crear un nuevo usuario de comunicación."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="users-form-close"
                        onClick={handleClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>

                {/* FORMULARIO */}
                <form
                    onSubmit={handleSubmit}
                    className="users-form"
                >
                    {/* NOMBRE Y APELLIDO */}
                    <div className="users-form-row">
                        <div className="users-form-field">
                            <label htmlFor="user-name">
                                Nombre
                            </label>

                            <input
                                id="user-name"
                                type="text"
                                value={data.name}
                                onChange={(event) =>
                                    setData(
                                        "name",
                                        event.target.value
                                    )
                                }
                                placeholder="Ingresá el nombre"
                                autoFocus
                            />

                            {errors.name && (
                                <span className="users-form-error">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="users-form-field">
                            <label htmlFor="user-last-name">
                                Apellido
                            </label>

                            <input
                                id="user-last-name"
                                type="text"
                                value={data.last_name}
                                onChange={(event) =>
                                    setData(
                                        "last_name",
                                        event.target.value
                                    )
                                }
                                placeholder="Ingresá el apellido"
                            />

                            {errors.last_name && (
                                <span className="users-form-error">
                                    {errors.last_name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className="users-form-field">
                        <label htmlFor="user-email">
                            Correo electrónico
                        </label>

                        <input
                            id="user-email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData(
                                    "email",
                                    event.target.value
                                )
                            }
                            placeholder="usuario@portal.com"
                        />

                        {errors.email && (
                            <span className="users-form-error">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* CONTRASEÑA */}
                    <div className="users-form-row">
                        <div className="users-form-field">
                            <label htmlFor="user-password">
                                {isEditing
                                    ? "Nueva contraseña"
                                    : "Contraseña"}
                            </label>

                            <input
                                id="user-password"
                                type="password"
                                value={data.password}
                                onChange={(event) =>
                                    setData(
                                        "password",
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    isEditing
                                        ? "Dejar vacío para mantenerla"
                                        : "Mínimo 8 caracteres"
                                }
                            />

                            {errors.password && (
                                <span className="users-form-error">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div className="users-form-field">
                            <label htmlFor="user-password-confirmation">
                                Confirmar contraseña
                            </label>

                            <input
                                id="user-password-confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        "password_confirmation",
                                        event.target.value
                                    )
                                }
                                placeholder="Repetí la contraseña"
                            />
                        </div>
                    </div>

                    {/* ROL */}
                    <div className="users-form-field">
                        <label>Rol</label>

                        <div className="users-form-role">
                            Comunicación
                        </div>

                        <span className="users-form-help">
                            El rol se asigna automáticamente.
                        </span>
                    </div>

                    {/* ACCIONES */}
                    <div className="users-form-actions">
                        <button
                            type="button"
                            className="users-form-cancel"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="users-form-submit"
                            disabled={processing}
                        >
                            {processing
                                ? "Guardando..."
                                : isEditing
                                ? "Guardar cambios"
                                : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}