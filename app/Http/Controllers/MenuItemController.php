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
            ->with([
                'children' => function ($query) {
                    $query->orderBy('order');
                },
            ])
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/Botonera', [
            'menuItems' => $menuItems,
        ]);
    }

    public function create()
    {
        $parentId = request()->integer('parent_id');

        $parentItem = null;

        if ($parentId) {
            $parentItem = MenuItem::findOrFail($parentId);
        }

        return Inertia::render('Admin/MenuItems/Create', [
            'parentItem' => $parentItem,
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request
                ->file('file')
                ->store('menu', 'public');
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
            'url' => $request->url,
            'file_path' => $filePath,
            'order' => $nextOrder,
            'is_active' => true,
            'is_quick_link' => false,
            'quick_link_order' => null,
        ]);

        return redirect()
            ->route('admin.botonera')
            ->with('success', 'Botón creado correctamente.');
    }

    public function edit(MenuItem $menuItem)
    {
        $parentItem = null;

        if ($menuItem->parent_id) {
            $parentItem = MenuItem::find(
                $menuItem->parent_id
            );
        }

        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => $menuItem,
            'parentItem' => $parentItem,
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
            'is_active' => $request->boolean('is_active'),
            'is_quick_link' => $request->boolean('is_quick_link'),
            'quick_link_order' => $request->quick_link_order,
        ];

        if ($request->hasFile('file')) {

            if ($menuItem->file_path) {
                Storage::disk('public')
                    ->delete($menuItem->file_path);
            }

            $data['file_path'] = $request
                ->file('file')
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
            ->route('admin.botonera')
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
            ->route('admin.botonera')
            ->with('success', 'Botón eliminado correctamente.');
    }
}