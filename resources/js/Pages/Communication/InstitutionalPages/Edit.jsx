import React from "react";

import { Head } from "@inertiajs/react";

import PanelLayout from "../../../Layouts/PanelLayout";

import InstitutionalPageForm from "./components/InstitutionalPageForm";

export default function Edit({
    page,
}) {
    return (
        <PanelLayout>
            <Head title="Editar contenido institucional" />

            <div className="page-container">
                <InstitutionalPageForm
                    page={page}
                    mode="edit"
                />
            </div>
        </PanelLayout>
    );
}