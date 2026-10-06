import React from 'react';
import { Head } from '@inertiajs/react';
import PanelLayout from '@/Layouts/PanelLayout';
import MenuItemForm from '@/Pages/Admin/Botonera/Form/MenuItemForm';

export default function Create({
    parentItem = null,
    institutionalPages = [],
}) {
    return (
        <PanelLayout>
            <Head title="Crear botón" />

            <div className="page-container">
                <MenuItemForm
                    parentItem={parentItem}
                    institutionalPages={institutionalPages}
                    mode="create"
                />
            </div>
        </PanelLayout>
    );
}