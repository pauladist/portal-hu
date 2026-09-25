<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\News;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with([
                'children' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('order'),
            ])
            ->orderBy('order')
            ->get();

        $quickLinks = MenuItem::query()
            ->where('is_active', true)
            ->where('is_quick_link', true)
            ->orderBy('quick_link_order')
            ->get();

        $featuredNews = News::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true)
                    ->limit(1),
            ])
            ->latest('published_at')
            ->first();

        $popularNews = News::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with([
                'media' => fn ($query) => $query
                    ->where('type', 'image')
                    ->where('is_featured', true)
                    ->limit(1),
            ])
            ->orderByDesc('views')
            ->limit(5)
            ->get();

        return Inertia::render('Welcome', [
            'menuItems' => $menuItems,
            'quickLinks' => $quickLinks,
            'featuredNews' => $featuredNews,
            'popularNews' => $popularNews,
        ]);
    }
}