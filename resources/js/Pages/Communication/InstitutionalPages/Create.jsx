import React from "react";

import { Head } from "@inertiajs/react";

import PanelLayout from "../../../Layouts/PanelLayout";

import InstitutionalPageForm from "./components/InstitutionalPageForm";

export default function Create() {
    return (
        <PanelLayout>
            <Head title="Crear contenido institucional" />

            <div className="page-container">
                <InstitutionalPageForm
                    mode="create"
                />
            </div>
        </PanelLayout>
    );
}