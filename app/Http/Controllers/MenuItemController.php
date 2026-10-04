<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\InstitutionalPage;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Listado de la botonera
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $menuItems = MenuItem::query()
            ->whereNull('parent_id')
            ->with([
                'page',
                'children' => function ($query) {
                    $query
                        ->with('page')
                        ->orderBy('order');
                },
            ])
            ->orderBy('order')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Páginas institucionales publicadas
        |--------------------------------------------------------------------------
        */

        $institutionalPages = InstitutionalPage::query()
            ->where('status', 'published')
            ->orderBy('title')
            ->get([
                'id',
                'title',
            ]);

        return Inertia::render('Admin/Botonera', [
            'menuItems' => $menuItems,
            'pages' => $institutionalPages,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Formulario de creación
    |--------------------------------------------------------------------------
    */

    public function create()
    {
        $parentId = request()->integer('parent_id');

        $parentItem = null;

        if ($parentId) {
            $parentItem = MenuItem::findOrFail($parentId);
        }

        $institutionalPages = InstitutionalPage::query()
            ->where('status', 'published')
            ->orderBy('title')
            ->get([
                'id',
                'title',
            ]);

        return Inertia::render('Admin/MenuItems/Create', [
            'parentItem' => $parentItem,
            'pages' => $institutionalPages,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Crear botón
    |--------------------------------------------------------------------------
    */

    public function store(StoreMenuItemRequest $request)
    {
        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('menu', 'public');
        }

        $parentId = $request->parent_id;

        $query = MenuItem::query();

        if ($parentId === null) {
            $query->whereNull('parent_id');
        } else {
            $query->where('parent_id', $parentId);
        }

        $nextOrder = ((int) $query->max('order')) + 1;

        MenuItem::create([
            'parent_id' => $parentId,
            'title' => $request->title,
            'destination_type' => $request->destination_type,
            'url' => $request->destination_type === 'url'
                ? $request->url
                : null,
            'page_id' => $request->destination_type === 'page'
                ? $request->page_id
                : null,
            'file_path' => $request->destination_type === 'pdf'
                ? $filePath
                : null,
            'order' => $nextOrder,
            'is_active' => true,
            'is_quick_link' => false,
            'quick_link_order' => null,
        ]);

        return redirect()
            ->route('admin.botonera')
            ->with('success', 'Botón creado correctamente.');
    }

    /*
    |--------------------------------------------------------------------------
    | Formulario de edición
    |--------------------------------------------------------------------------
    */

    public function edit(MenuItem $menuItem)
    {
        $parentItem = null;

        if ($menuItem->parent_id) {
            $parentItem = MenuItem::find($menuItem->parent_id);
        }

        $institutionalPages = InstitutionalPage::query()
            ->where('status', 'published')
            ->orderBy('title')
            ->get([
                'id',
                'title',
            ]);

        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => $menuItem,
            'parentItem' => $parentItem,
            'pages' => $institutionalPages,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar botón
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateMenuItemRequest $request,
        MenuItem $menuItem
    ) {
        $data = [
            'parent_id' => $request->parent_id,
            'title' => $request->title,
            'destination_type' => $request->destination_type,
            'url' => $request->destination_type === 'url'
                ? $request->url
                : null,
            'page_id' => $request->destination_type === 'page'
                ? $request->page_id
                : null,
            'order' => $request->order,
            'is_active' => $request->boolean('is_active'),
            'is_quick_link' => $request->boolean('is_quick_link'),
            'quick_link_order' => $request->quick_link_order,
        ];

        /*
        |--------------------------------------------------------------------------
        | Nuevo PDF
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('file')) {
            if ($menuItem->file_path) {
                Storage::disk('public')->delete(
                    $menuItem->file_path
                );
            }

            $data['file_path'] = $request
                ->file('file')
                ->store('menu', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Si deja de ser PDF, eliminamos el archivo anterior
        |--------------------------------------------------------------------------
        */

        if ($request->destination_type !== 'pdf') {
            if ($menuItem->file_path) {
                Storage::disk('public')->delete(
                    $menuItem->file_path
                );
            }

            $data['file_path'] = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Si deja de ser URL, eliminamos la URL
        |--------------------------------------------------------------------------
        */

        if ($request->destination_type !== 'url') {
            $data['url'] = null;
        }

        $menuItem->update($data);

        return redirect()
            ->route('admin.botonera')
            ->with('success', 'Botón actualizado correctamente.');
    }

    /*
    |--------------------------------------------------------------------------
    | Activar / desactivar
    |--------------------------------------------------------------------------
    */

    public function toggleStatus(MenuItem $menuItem)
    {
        $menuItem->update([
            'is_active' => ! $menuItem->is_active,
        ]);

        return redirect()
            ->route('admin.botonera');
    }

    /*
    |--------------------------------------------------------------------------
    | Acceso rápido
    |--------------------------------------------------------------------------
    */

    public function toggleQuickLink(MenuItem $menuItem)
    {
        /*
        |--------------------------------------------------------------------------
        | Si ya es acceso rápido, lo quitamos.
        |--------------------------------------------------------------------------
        */

        if ($menuItem->is_quick_link) {
            $menuItem->update([
                'is_quick_link' => false,
                'quick_link_order' => null,
            ]);

            return redirect()
                ->route('admin.botonera');
        }

        /*
        |--------------------------------------------------------------------------
        | Verificar límite de 8 accesos rápidos
        |--------------------------------------------------------------------------
        */

        $quickLinksCount = MenuItem::query()
            ->where('is_quick_link', true)
            ->count();

        if ($quickLinksCount >= 8) {
            return redirect()
                ->route('admin.botonera')
                ->withErrors([
                    'quick_link' =>
                    'No podés agregar más accesos rápidos. El límite es de 8.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Asignar posición siguiente
        |--------------------------------------------------------------------------
        */

        $nextQuickLinkOrder = (
            (int) MenuItem::query()
                ->where('is_quick_link', true)
                ->max('quick_link_order')
        ) + 1;

        $menuItem->update([
            'is_quick_link' => true,
            'quick_link_order' => $nextQuickLinkOrder,
        ]);

        return redirect()
            ->route('admin.botonera');
    }

    /*
    |--------------------------------------------------------------------------
    | Reordenar elementos
    |--------------------------------------------------------------------------
    */

    public function reorder(Request $request)
    {
        $data = $request->validate([
            'item_id' => [
                'required',
                'integer',
                'exists:menu_items,id',
            ],
            'target_id' => [
                'required',
                'integer',
                'exists:menu_items,id',
            ],
        ]);

        $item = MenuItem::findOrFail($data['item_id']);
        $target = MenuItem::findOrFail($data['target_id']);

        /*
        |--------------------------------------------------------------------------
        | No se puede modificar la jerarquía
        |--------------------------------------------------------------------------
        */

        if ($item->parent_id !== $target->parent_id) {
            return back()->withErrors([
                'reorder' =>
                'No se puede modificar la jerarquía establecida. Solo podés reordenar elementos dentro del mismo nivel.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Mismo elemento
        |--------------------------------------------------------------------------
        */

        if ($item->id === $target->id) {
            return back();
        }

        /*
        |--------------------------------------------------------------------------
        | Obtener hermanos
        |--------------------------------------------------------------------------
        */

        $siblings = MenuItem::query()
            ->where('parent_id', $item->parent_id)
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        $orderedIds = $siblings
            ->pluck('id')
            ->values()
            ->all();

        $itemIndex = array_search(
            $item->id,
            $orderedIds,
            true
        );

        $targetIndex = array_search(
            $target->id,
            $orderedIds,
            true
        );

        if (
            $itemIndex === false ||
            $targetIndex === false
        ) {
            return back()->withErrors([
                'reorder' =>
                'No se pudo determinar el orden de los elementos.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Sacar el elemento de su posición actual
        |--------------------------------------------------------------------------
        */

        array_splice(
            $orderedIds,
            $itemIndex,
            1
        );

        /*
        |--------------------------------------------------------------------------
        | Buscar nuevamente la posición del destino
        |--------------------------------------------------------------------------
        */

        $targetIndex = array_search(
            $target->id,
            $orderedIds,
            true
        );

        /*
        |--------------------------------------------------------------------------
        | Insertar en la nueva posición
        |--------------------------------------------------------------------------
        */

        array_splice(
            $orderedIds,
            $targetIndex,
            0,
            [$item->id]
        );

        /*
        |--------------------------------------------------------------------------
        | Guardar nuevo orden
        |--------------------------------------------------------------------------
        */

        foreach ($orderedIds as $index => $id) {
            MenuItem::whereKey($id)->update([
                'order' => $index + 1,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Volver sin recargar la página
        |--------------------------------------------------------------------------
        */

        return back();
    }

    /*
    |--------------------------------------------------------------------------
    | Eliminar botón
    |--------------------------------------------------------------------------
    */

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->file_path) {
            Storage::disk('public')->delete(
                $menuItem->file_path
            );
        }

        $menuItem->delete();

        return redirect()
            ->route('admin.botonera')
            ->with('success', 'Botón eliminado correctamente.');
    }
}