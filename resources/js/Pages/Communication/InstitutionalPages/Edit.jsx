import React from 'react';
import { Head } from '@inertiajs/react';
import PanelLayout from '../../../Layouts/PanelLayout';
import MenuItemForm from '../Botonera/Form/MenuItemForm';

export default function Edit({
    menuItem,
    parentItem = null,
    pages = [],
}) {
    return (
        <PanelLayout>
            <Head title="Editar botón" />

            <div className="page-container">
                <MenuItemForm
                    menuItem={menuItem}
                    parentItem={parentItem}
                    pages={pages}
                    mode="edit"
                />
            </div>
        </PanelLayout>
    );
}