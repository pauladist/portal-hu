import React from 'react';
import { Head } from '@inertiajs/react';
import PanelLayout from '../../../Layouts/PanelLayout';
import MenuItemForm from '../Botonera/Form/MenuItemForm';

export default function Create({
    parentItem = null,
    pages = [],
}) {
    return (
        <PanelLayout>
            <Head title="Crear botón" />

            <div className="page-container">
                <MenuItemForm
                    parentItem={parentItem}
                    pages={pages}
                    mode="create"
                />
            </div>
        </PanelLayout>
    );
}