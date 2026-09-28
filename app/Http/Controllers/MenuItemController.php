<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::query()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/Botonera', [
            'menuItems' => $menuItems,
        ]);
    }

    public function create()
    {
        $menuItems = MenuItem::orderBy('title')->get();

        return Inertia::render('Admin/MenuItems/Create', [
            'menuItems' => $menuItems,
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')
                ->store('menu', 'public');
        }

        MenuItem::create([
            'parent_id' => $request->parent_id,
            'title' => $request->title,
            'destination_type' => $request->destination_type,
            'url' => $request->url,
            'file_path' => $filePath,
            'order' => $request->order,
            'is_active' => $request->is_active,
            'is_quick_link' => $request->boolean('is_quick_link'),
            'quick_link_order' => $request->quick_link_order,
        ]);

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón creado correctamente.');
    }

    public function edit(MenuItem $menuItem)
    {
        $menuItems = MenuItem::where('id', '!=', $menuItem->id)
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => $menuItem,
            'menuItems' => $menuItems,
        ]);
    }

    public function update(
        UpdateMenuItemRequest $request,
        MenuItem $menuItem
    ) {
        $data = [
            'parent_id' => $request->parent_id,
            'title' => $request->title,
            'destination_type' => $request->destination_type,
            'url' => $request->url,
            'order' => $request->order,
            'is_active' => $request->is_active,
            'is_quick_link' => $request->boolean('is_quick_link'),
            'quick_link_order' => $request->quick_link_order,
        ];

        if ($request->hasFile('file')) {

            if ($menuItem->file_path) {
                Storage::disk('public')
                    ->delete($menuItem->file_path);
            }

            $data['file_path'] = $request->file('file')
                ->store('menu', 'public');
        }

        if ($request->destination_type !== 'pdf') {

            if ($menuItem->file_path) {
                Storage::disk('public')
                    ->delete($menuItem->file_path);
            }

            $data['file_path'] = null;
        }

        if ($request->destination_type !== 'url') {
            $data['url'] = null;
        }

        $menuItem->update($data);

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón actualizado correctamente.');
    }

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->file_path) {
            Storage::disk('public')
                ->delete($menuItem->file_path);
        }

        $menuItem->delete();

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón eliminado correctamente.');
    }
}
