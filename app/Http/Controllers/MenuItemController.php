<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::orderBy('order')
            ->get();

        return Inertia::render('Admin/MenuItems/Index', [
            'menuItems' => $menuItems,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MenuItems/Create');
    }

    public function store(StoreMenuItemRequest $request)
    {
        MenuItem::create([
            'title' => $request->title,
            'url' => $request->url,
            'order' => $request->order,
            'is_active' => $request->is_active,
        ]);

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón creado correctamente.');
    }

    public function edit(MenuItem $menuItem)
    {
        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => $menuItem,
        ]);
    }

    public function update(
        UpdateMenuItemRequest $request,
        MenuItem $menuItem
    ) {
        $menuItem->update([
            'title' => $request->title,
            'url' => $request->url,
            'order' => $request->order,
            'is_active' => $request->is_active,
        ]);

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón actualizado correctamente.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Botón eliminado correctamente.');
    }
}