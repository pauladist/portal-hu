<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\News;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::publicTree();

        $quickLinks = MenuItem::publicQuickLinks();

        // Carrusel: las 5 noticias publicadas más recientes
        $latestNews = News::published()
            ->select(['id', 'title', 'slug', 'subtitle', 'published_at'])
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true),
            ])
            ->latest('published_at')
            ->limit(5)
            ->get();

        $popularNews = News::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true)
            ])
            ->orderByDesc('views')
            ->limit(5)
            ->get();

        /*
        | Noticias del mes: todas las publicadas en el mes actual
        | (el "Ver más" se resuelve en el frontend).
        */
        $monthNews = News::published()
            ->where('published_at', '>=', now()->startOfMonth())
            ->select(['id', 'title', 'slug', 'subtitle', 'published_at'])
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true),
            ])
            ->latest('published_at')
            ->get();

        return Inertia::render('Welcome', [
            'menuItems' => $menuItems,
            'quickLinks' => $quickLinks,
            'latestNews' => $latestNews,
            'popularNews' => $popularNews,
            'monthNews' => $monthNews,
            'monthInfo' => [
                'name' => now()->locale('es')->translatedFormat('F'),
            ],
        ]);
    }
}