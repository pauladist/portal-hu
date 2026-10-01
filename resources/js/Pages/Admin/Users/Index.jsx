import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PanelLayout from "@/Layouts/PanelLayout";

import UserForm from "./UserForm";
import "./Users.css";

export default function Index({ users = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const handleDelete = () => {
        if (!deletingUser) {
            return;
        }

        // Nunca permitir eliminar un administrador
        if (deletingUser.role?.name === "Administrador") {
            setDeletingUser(null);
            return;
        }

        router.delete(`/admin/users/${deletingUser.id}`, {
            preserveScroll: true,

            onFinish: () => {
                setDeletingUser(null);
            },
        });
    };

    return (
        <PanelLayout title="Usuarios">
            <Head title="Usuarios" />

            <div className="users-page">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="users-header">
                    <div>
                        <h1>Usuarios</h1>

                        <p>
                            Administrá los usuarios que tienen acceso al
                            panel de comunicación.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="users-primary-button"
                        onClick={handleCreate}
                    >
                        <span>+</span>
                        Nuevo usuario
                    </button>
                </div>


                {/* =====================================================
                    TABLA
                ===================================================== */}

                <div className="users-content">
                    {users.length === 0 ? (
                        <div className="users-empty">
                            <h3>No hay usuarios registrados</h3>

                            <p>
                                Todavía no se han creado usuarios de
                                comunicación.
                            </p>
                        </div>
                    ) : (
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => {
                                        const isAdmin =
                                            user.role?.name ===
                                            "Administrador";

                                        return (
                                            <tr key={user.id}>

                                                {/* NOMBRE */}
                                                <td>
                                                    <div className="user-name">
                                                        <strong>
                                                            {user.name}{" "}
                                                            {user.last_name}
                                                        </strong>
                                                    </div>
                                                </td>


                                                {/* EMAIL */}
                                                <td>
                                                    <span className="user-email">
                                                        {user.email}
                                                    </span>
                                                </td>


                                                {/* ROL */}
                                                <td>
                                                    <span className="user-role">
                                                        {user.role?.name ||
                                                            "Comunicación"}
                                                    </span>
                                                </td>


                                                {/* ACCIONES */}
                                                <td>
                                                    <div className="user-actions">

                                                        {/* EDITAR */}
                                                        <button
                                                            type="button"
                                                            className="user-action-button user-action-edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    user
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </button>


                                                        {/* ELIMINAR
                                                            SOLO COMUNICACIÓN
                                                        */}
                                                        {!isAdmin && (
                                                            <button
                                                                type="button"
                                                                className="user-action-button user-action-delete"
                                                                onClick={() =>
                                                                    setDeletingUser(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}

                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


            {/* =========================================================
                MODAL CREAR / EDITAR
            ========================================================= */}

            {showForm && (
                <UserForm
                    user={editingUser}
                    onClose={handleCloseForm}
                />
            )}


            {/* =========================================================
                MODAL ELIMINAR
            ========================================================= */}

            {deletingUser && (
                <div
                    className="users-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setDeletingUser(null);
                        }
                    }}
                >
                    <div className="users-delete-modal">

                        <div className="users-delete-content">

                            <h2>
                                Eliminar usuario
                            </h2>

                            <p>
                                ¿Estás segura de que querés eliminar al
                                usuario{" "}
                                <strong>
                                    {deletingUser.name}{" "}
                                    {deletingUser.last_name}
                                </strong>
                                ?
                            </p>

                            <span>
                                Esta acción no se puede deshacer.
                            </span>

                        </div>


                        <div className="users-delete-actions">

                            <button
                                type="button"
                                className="users-delete-cancel"
                                onClick={() =>
                                    setDeletingUser(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="users-delete-confirm"
                                onClick={handleDelete}
                            >
                                Eliminar
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </PanelLayout>
    );
}