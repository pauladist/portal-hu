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
        | Resto de las noticias del mes: las publicadas en el mes actual
        | que no se están mostrando ya en el carrusel ni en las populares.
        */
        $shownIds = $latestNews->pluck('id')
            ->merge($popularNews->pluck('id'))
            ->unique();

        $monthQuery = News::published()
            ->where('published_at', '>=', now()->startOfMonth())
            ->whereNotIn('id', $shownIds);

        $monthTotal = (clone $monthQuery)->count();

        $monthNews = $monthQuery
            ->select(['id', 'title', 'slug', 'subtitle', 'published_at'])
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true),
            ])
            ->latest('published_at')
            ->limit(9)
            ->get();

        return Inertia::render('Welcome', [
            'menuItems' => $menuItems,
            'quickLinks' => $quickLinks,
            'latestNews' => $latestNews,
            'popularNews' => $popularNews,
            'monthNews' => $monthNews,
            'monthInfo' => [
                'name' => now()->locale('es')->translatedFormat('F'),
                'year' => now()->year,
                'month' => now()->month,
                'total' => $monthTotal,
            ],
        ]);
    }
}