import React from 'react';
import { Head } from '@inertiajs/react';
import PanelLayout from '@/Layouts/PanelLayout';
import MenuItemForm from '@/Pages/Admin/Botonera/Form/MenuItemForm';

export default function Edit({
    menuItem,
    parentItem = null,
    institutionalPages = [],
}) {
    return (
        <PanelLayout>
            <Head title="Editar botón" />

            <div className="page-container">
                <MenuItemForm
                    menuItem={menuItem}
                    parentItem={parentItem}
                    institutionalPages={institutionalPages}
                    mode="edit"
                />
            </div>
        </PanelLayout>
    );
}